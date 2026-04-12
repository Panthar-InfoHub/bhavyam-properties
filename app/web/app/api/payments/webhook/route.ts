import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature
    const isDevBypass = process.env.NODE_ENV === 'development' && req.headers.get('x-test-bypass') === 'true';
    
    if (!isDevBypass) {
      if (!signature || !webhookSecret) {
        console.error('Webhook Error: Signature or Secret missing');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Webhook Error: Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('⚠️ WEBHOOK SIGNATURE BYPASSED FOR LOCAL TESTING');
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    console.log(`Razorpay Webhook Received: ${event} for Order: ${orderId}`);

    const supabase = await createClient();

    // Handle successful payment
    if (event === 'payment.captured' || event === 'order.paid') {
      
      // 1. Find the transaction in our DB
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (txError || !transaction) {
        console.error('Transaction not found for order:', orderId);
        // We still return 200 to Razorpay to stop retries
        return NextResponse.json({ received: true });
      }

      if (transaction.status === 'completed') {
        return NextResponse.json({ received: true });
      }

      // 2. Update transaction status
      await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      // 3. Fetch Plan Details for dynamic values
      const { data: plan } = await supabase
        .from('plans')
        .select('duration_days, credits_awarded')
        .eq('id', transaction.plan_id)
        .maybeSingle();

      const duration = plan?.duration_days || 30;

      // 4. Apply the purchase
      if (transaction.payment_type === 'subscription') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await supabase
          .from('profiles')
          .update({
            plan_id: transaction.plan_id,
            subscription_plan: 'premium',
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', transaction.user_id);

        console.log(`Membership activated for user: ${transaction.user_id}`);
      } 
      else if (transaction.payment_type === 'credit_pack') {
        const awarded = plan?.credits_awarded || 0;
        
        await supabase.rpc('increment_user_credits', {
          p_user_id: transaction.user_id,
          p_credits: awarded
        });

        console.log(`Awarded ${awarded} credits to user: ${transaction.user_id}`);
      }
      else if (transaction.payment_type === 'unlock') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await supabase
          .from('property_unlocks')
          .insert({
            user_id: transaction.user_id,
            property_id: transaction.property_id,
            expires_at: expiresAt.toISOString()
          });

        console.log(`Property ${transaction.property_id} unlocked for user: ${transaction.user_id}`);
      }
    } else if (event === 'payment.failed') {
      // Handle failed payment
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('id')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (!txError && transaction) {
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id);
          
        console.error(`Payment failed for order: ${orderId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
