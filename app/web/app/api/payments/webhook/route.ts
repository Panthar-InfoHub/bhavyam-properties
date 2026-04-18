import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabaseServer';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature
    const isDevBypass = process.env.NODE_ENV === 'development' && req.headers.get('x-test-bypass') === 'true';
    
    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    console.log('🚀 --- RAZORPAY WEBHOOK START ---');
    console.log(`📡 Event: ${event}`);
    console.log(`📦 Order ID: ${orderId}`);
    console.log(`💰 Payment Amount: ${payment.amount / 100} ${payment.currency}`);

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Initial Log Entry in DB (Background)
    try {
        await supabase.from('webhook_logs').insert({ event, order_id: orderId, payload, status: 'received' });
    } catch (e) {
        console.warn('⚠️ Webhook Log Table warning: could not write to DB.');
    }

    if (!isDevBypass) {
      console.log('🔐 Verifying Signature...');
      if (!signature || !webhookSecret) {
        console.error('❌ Webhook Error: Signature or Secret missing');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Webhook Error: Invalid signature mismatch');
        console.log('--- SIGNATURE DEBUG ---');
        console.log('Received:', signature);
        console.log('Expected:', expectedSignature);
        console.log('--- END DEBUG ---');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Signature Verified');
    } else {
      console.log('⚠️ WEBHOOK SIGNATURE BYPASSED FOR LOCAL TESTING');
    }

    // Handle successful payment
    if (event === 'payment.captured' || event === 'order.paid') {
      console.log('💳 Processing successful payment (Admin Context)...');
      
      const { data: transaction, error: txError } = await adminSupabase
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (txError || !transaction) {
        console.error('❌ Transaction not found for order:', orderId);
        return NextResponse.json({ received: true });
      }

      if (transaction.status === 'completed') {
        console.log('⏭️ Already completed. Skipping.');
        return NextResponse.json({ received: true });
      }

      // Update Transaction
      await adminSupabase
        .from('transactions')
        .update({ 
          status: 'completed',
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      // Fetch Plan
      const { data: plan } = await adminSupabase
        .from('plans')
        .select('*')
        .eq('id', transaction.plan_id)
        .maybeSingle();

      const duration = plan?.duration_days || 30;

      // Fulfillment via Admin Client
      if (transaction.payment_type === 'subscription') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await adminSupabase
          .from('profiles')
          .update({
            plan_id: transaction.plan_id,
            subscription_plan: 'premium',
            subscription_expires_at: expiresAt.toISOString()
          })
          .eq('id', transaction.user_id);

        console.log(`✅ Membership ACTIVATED for user: ${transaction.user_id}`);
      } 
      else if (transaction.payment_type === 'credit_pack') {
        const awarded = plan?.credits_awarded || 0;
        const { error: rpcError } = await adminSupabase.rpc('increment_user_credits', {
          p_user_id: transaction.user_id,
          p_credits: awarded
        });
        
        if (rpcError) console.error('❌ Wallet Update Error:', rpcError);
        else console.log(`✅ Awarded ${awarded} CREDITS to wallet for user: ${transaction.user_id}`);
      }
      else if (transaction.payment_type === 'unlock') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + duration);

        await adminSupabase
          .from('property_unlocks')
          .insert({
            user_id: transaction.user_id,
            property_id: transaction.property_id,
            expires_at: expiresAt.toISOString()
          });
        console.log(`✅ Property UNLOCKED for user: ${transaction.user_id}`);
      }
      
      console.log('🏁 Webhook process COMPLETED successfully.');

    } else if (event === 'payment.failed') {
      console.log(`🔴 Handle payment failure for Order: ${orderId}`);
      await supabase
        .from('transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', orderId);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('🔥 Webhook Route CRITICAL Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
