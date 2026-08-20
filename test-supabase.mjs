import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ftjbspntpjymknnoyzeb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fGEzuWU6Dr35tr_Y_Knd9Q_Vkp4_rt6';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('--- SUPABASE RLS & ARCHITECTURE TEST ---');
  
  // 1. Create Test User A
  const emailA = `attacker_${Date.now()}@test.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: emailA,
    password: 'password123',
    options: {
      data: { full_name: 'Attacker A' }
    }
  });

  if (authError) {
    console.error('Failed to create test user:', authError.message);
    return;
  }
  
  const userId = authData.user.id;
  console.log('Test User Created:', userId);

  // 2. Test Price Manipulation (Insert Order with malicious total_amount)
  console.log('\n[TEST 1] Price Manipulation - Insert Order');
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      customer_name: 'Attacker',
      customer_email: emailA,
      customer_phone: '123',
      shipping_address: 'Hacked Address',
      total_amount: 1, 
      status: 'paid' 
    })
    .select()
    .single();

  if (orderError) {
    console.log('BLOCKED: Could not insert malicious order:', orderError.message);
  } else {
    console.log('EXPLOITED: Successfully inserted order with total_amount = 1 and status = paid');
    console.log('Inserted Order:', orderData.id, orderData.total_amount, orderData.status);
    
    // 3. Test IDOR - Modify another user's order? 
    console.log('\n[TEST 2] Ownership Manipulation / IDOR');
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const { data: idorData, error: idorError } = await supabase
      .from('orders')
      .insert({
        user_id: fakeUserId, 
        customer_name: 'IDOR',
        total_amount: 100,
        status: 'pending'
      })
      .select();
      
    if (idorError) {
      console.log('BLOCKED: Could not create order for another user:', idorError.message);
    } else {
      console.log('EXPLOITED: Created order for another user (IDOR)');
    }
    
    // 4. Test Inventory Manipulation - Update product stock
    console.log('\n[TEST 3] Inventory Manipulation');
    const { data: products } = await supabase.from('products').select('*').limit(1);
    if (products && products.length > 0) {
      const productId = products[0].id;
      const { data: updateData, error: updateError } = await supabase
        .from('products')
        .update({ price: 1 })
        .eq('id', productId);
        
      if (updateError) {
        console.log('BLOCKED: Could not update product price:', updateError.message);
      } else {
        console.log('EXPLOITED: Successfully updated product price!');
      }
    }
  }

  await supabase.auth.signOut();
}

runTests();
