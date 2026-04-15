import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as base16 from 'https://deno.land/std@0.168.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

async function verifyRazorpaySignature(body: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const keyParams = { name: 'HMAC', hash: 'SHA-256' };
  
  const key = await crypto.subtle.importKey(
    'raw', 
    encoder.encode(secret), 
    keyParams, 
    false, 
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC', 
    key, 
    encoder.encode(body)
  );

  const expectedSignatureHex = new TextDecoder().decode(base16.encode(new Uint8Array(signatureBuffer)));
  return signature === expectedSignatureHex;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');

    // Verification
    if (!signature || !webhookSecret) {
      console.error('Webhook Error: Signature or Secret missing');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const isValid = await verifyRazorpaySignature(rawBody, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Webhook Error: Invalid signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    console.log(`Razorpay Webhook Received: ${event} for Order: ${orderId}`);

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service-role to bypass RLS in the edge function
      { auth: { persistSession: false } }
    );

    if (event === 'payment.captured' || event === 'order.paid') {
      const { data: transaction, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (txError || !transaction) {
        console.error('Transaction not found for order:', orderId);
        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (transaction.status === 'completed') {
        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Update tx to completed
      await supabaseClient
        .from('transactions')
        .update({ 
          status: 'completed',
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      const { data: plan } = await supabaseClient
        .from('plans')
        .select('duration_days, credits_awarded')
        .eq('id', transaction.plan_id)
        .maybeSingle();

      const duration = plan?.duration_days || 30;

      // Fulfillment
      if (transaction.payment_type === 'subscription') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await supabaseClient
          .from('profiles')
          .update({
            plan_id: transaction.plan_id,
            subscription_plan: 'premium',
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', transaction.user_id);
      } 
      else if (transaction.payment_type === 'credit_pack') {
        const awarded = plan?.credits_awarded || 0;
        await supabaseClient.rpc('increment_user_credits', {
          p_user_id: transaction.user_id,
          p_credits: awarded
        });
      }
      else if (transaction.payment_type === 'unlock') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await supabaseClient
          .from('property_unlocks')
          .insert({
            user_id: transaction.user_id,
            property_id: transaction.property_id,
            expires_at: expiresAt.toISOString()
          });
      }

    } else if (event === 'payment.failed') {
      // Handle failed payment
      const { data: transaction, error: txError } = await supabaseClient
        .from('transactions')
        .select('id')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (!txError && transaction) {
        await supabaseClient
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
          
        console.error(`Payment failed for order: ${orderId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})
