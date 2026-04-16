import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabaseServer';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, propertyId = null } = await req.json();

    console.log('🛡️ --- PAYMENT VERIFICATION START ---');
    console.log(`📡 Order ID: ${razorpay_order_id}`);
    
    // Verify signature
    const isDevBypass = process.env.NODE_ENV === 'development' && req.headers.get('x-test-bypass') === 'true';

    if (!isDevBypass) {
        console.log('🔐 Verifying Signature...');
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          console.error('❌ Signature verification failed');
          return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
        }
        console.log('✅ Signature Authentic');
    } else {
        console.log('⚠️ BYPASSING SIGNATURE FOR LOCAL TESTING');
    }

    // Update DB
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'User authenticated required' }, { status: 401 });
    }

    // 1. Find the existing pending transaction
    const { data: transaction, error: txError } = await adminSupabase
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', razorpay_order_id)
        .maybeSingle();

    if (txError || !transaction) {
        console.error('❌ Transaction record not found in DB');
        throw new Error('Transaction record not found');
    }

    if (transaction.status === 'completed') {
        console.log('⏭️ Transaction already fulfilled by Webhook. Success.');
        return NextResponse.json({ message: 'Success (Already Fulfilled)' });
    }

    // 2. Fetch Plan Details
    const { data: plan, error: planError } = await adminSupabase
      .from('plans')
      .select('*')
      .eq('id', planId || transaction.plan_id)
      .single();

    if (planError || !plan) {
      console.error('❌ Plan configuration not found');
      throw new Error('Plan not found');
    }

    console.log(`📑 Processing Fulfillment (Admin): ${plan.type} for user ${user.id}`);

    // 3. Mark transaction as completed
    await adminSupabase.from('transactions')
        .update({
            status: 'completed',
            razorpay_payment_id,
            updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

    // 4. Update User Access (Same logic as Webhook)
    const duration = plan.duration_days || 30;

    if (plan.type === 'subscription') {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + duration);

      await adminSupabase.from('profiles').update({
        plan_id: plan.id,
        subscription_plan: 'premium',
        subscription_expires_at: expiry.toISOString()
      }).eq('id', user.id);
      
      console.log(`✅ Membership ACTIVATED until ${expiry.toLocaleDateString()}`);
    } 
    else if (plan.type === 'credit_pack') {
        const credits = plan.credits_awarded || 0;
        const { error: rpcError } = await adminSupabase.rpc('increment_user_credits', {
            p_user_id: user.id,
            p_credits: credits
        });
        
        if (rpcError) console.error('❌ Wallet Update Error:', rpcError);
        else console.log(`✅ Awarded ${credits} CREDITS to balance`);
    }
    else if ((plan.type === 'single_unlock' || plan.type === 'unlock') && (propertyId || transaction.property_id)) {
      const pid = propertyId || transaction.property_id;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (plan.duration_days || 7));

      await adminSupabase.from('property_unlocks').upsert({
        user_id: user.id,
        property_id: pid,
        expires_at: expiry.toISOString()
      });
      console.log(`✅ Property ${pid} UNLOCKED`);
    }

    console.log('🏁 Verification and Fulfillment COMPLETE.');
    return NextResponse.json({ message: 'Success' });
  } catch (err: any) {
    console.error('🔥 Error verifying payment:', err);
    // Write error to local file so Antigravity can read it
    const fs = require('fs');
    fs.appendFileSync('verify-error.log', new Date().toISOString() + '\\n' + (err.stack || err.message) + '\\n\\n');

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

