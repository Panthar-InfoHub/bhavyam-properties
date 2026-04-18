import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabaseServer';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // 1. Safe Body Parsing
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('❌ [create-order] Invalid JSON body');
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { planId, amount, currency = 'INR', propertyId = null, payment_type = 'unlock' } = body;
    
    console.log('💳 [create-order] Starting order cycle...', { planId, amount, payment_type });

    // 2. Validate essential inputs
    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: `Amount is required and must be a number (Received: ${amount})` }, { status: 400 });
    }

    // 3. Auth Check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ [create-order] Auth failure:', authError);
      return NextResponse.json({ error: 'You must be logged in to perform this action. ' + (authError?.message || '') }, { status: 401 });
    }

    // 4. Client Check (Supabase Admin & Razorpay)
    let adminSupabase, order;
    try {
      adminSupabase = createAdminClient();
    } catch (e: any) {
      console.error('❌ [create-order] Admin Client initialization failed');
      return NextResponse.json({ error: 'Server configuration error (Supabase Admin): ' + e.message }, { status: 500 });
    }

    // 5. Razorpay order creation
    try {
      order = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency,
        receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { userId: user.id, planId, propertyId }
      });
    } catch (rzpErr: any) {
      console.error('❌ [create-order] Razorpay Error:', rzpErr.message);
      return NextResponse.json({ error: 'Payment Provider Error: ' + rzpErr.message }, { status: 500 });
    }
    
    // 6. Profile Synchronization (FK Fix)
    console.log('👤 [create-order] Syncing profile for:', user.id);
    const { data: profile } = await adminSupabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

    if (!profile) {
      const metadata = user.user_metadata || {};
      const parts = (metadata.full_name || metadata.name || 'Bhavyam User').trim().split(' ');
      
      const { error: upsertError } = await adminSupabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        first_name: parts[0],
        last_name: parts.length > 1 ? parts.slice(1).join(' ') : '',
        role: 'buyer' 
      }, { onConflict: 'id' });

      if (upsertError) console.warn('⚠️ [create-order] Profile creation warning:', upsertError.message);
    }

    // 7. Log Transaction Table
    console.log('📝 [create-order] Recording transaction...');
    const { error: insertError } = await adminSupabase.from('transactions').insert({
      user_id: user.id,
      plan_id: planId || null,
      property_id: propertyId || null,
      amount: Number(amount),
      currency,
      status: 'pending',
      payment_type,
      razorpay_order_id: order.id
    });

    if (insertError) {
        console.error('❌ [create-order] Database Insert Error:', insertError);
        return NextResponse.json({ error: 'Failed to log transaction in database: ' + insertError.message }, { status: 500 });
    }

    console.log('✅ [create-order] SUCCESS. ID:', order.id);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error('🔥 [create-order] Total Failure:', err);
    return NextResponse.json({ 
      error: 'A global unexpected error occurred.', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
