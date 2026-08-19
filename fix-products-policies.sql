-- Fix RLS policies for products table
-- Cho phep admin CRUD operations

-- Xoa policies cu
DROP POLICY IF EXISTS "Users can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Tao policies moi
-- Cho tat ca users xem products (public)
create policy "Anyone can view products"
  on products for select
  to public
  using (true);

-- Cho admin CRUD operations
create policy "Admins can manage products"
  on products for all
  to authenticated
  using (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3')
  with check (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3');

-- Kiem tra policies sau khi tao
SELECT * FROM pg_policies WHERE tablename = 'products';
