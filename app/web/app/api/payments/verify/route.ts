import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, propertyId = null } = await req.json();

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // Update DB
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User authenticated required' }, { status: 401 });
    }

    // 1. Fetch Plan Details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // 2. Log Transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      property_id: propertyId,
      amount: plan.price,
      currency: 'INR',
      status: 'completed',
      payment_type: plan.type,
      razorpay_order_id,
      razorpay_payment_id
    });

    // 3. Update User Access
    if (plan.type === 'subscription') {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (plan.duration_days || 30));

      await supabase.from('profiles').update({
        subscription_plan: plan.name,
        subscription_expires_at: expiry.toISOString()
      }).eq('id', user.id);
    } else if (plan.type === 'single_unlock' && propertyId) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (plan.duration_days || 7));

      await supabase.from('property_unlocks').upsert({
        user_id: user.id,
        property_id: propertyId,
        expires_at: expiry.toISOString()
      });
    }

    return NextResponse.json({ message: 'Success' });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
