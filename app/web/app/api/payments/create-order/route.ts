import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { planId, amount, currency = 'INR', propertyId = null, payment_type = 'unlock' } = await req.json();
    const supabase = await createClient();
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
    await supabase.from('transactions').insert({
      user_id: user.id,
      plan_id: planId,
      property_id: propertyId,
      amount: amount,
      currency: currency,
      status: 'pending',
      payment_type,
      razorpay_order_id: order.id
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('Error creating Razorpay order:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
