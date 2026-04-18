import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabaseServer';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { planId, amount, currency = 'INR', propertyId = null, payment_type = 'unlock' } = await req.json();
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        planId,
        propertyId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Initial log of pending transaction
    const { error: insertError } = await adminSupabase.from('transactions').insert({
      user_id: user.id,
      plan_id: planId,
      property_id: propertyId,
      amount: amount,
      currency: currency,
      status: 'pending',
      payment_type,
      razorpay_order_id: order.id
    });

    if (insertError) {
        console.error('❌ Failed to log pending transaction:', insertError);
        throw new Error('Failed to log transaction');
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    // Write error to local file so Antigravity can read it for debugging
    try {
        const fs = require('fs');
        fs.appendFileSync('create-error.log', new Date().toISOString() + '\\n' + (err.stack || err.message) + '\\n\\n');
    } catch(e) {}
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
