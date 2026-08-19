-- Simple fix - remove all policies and create basic ones
-- Chay trong SQL Editor

-- Xoa het policies cu
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Tao policies don gian - khong co recursion
create policy "Users can view their own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Cho phep admin xem tat ca (dung hardcode cho user admin dau tien)
create policy "Admins can view all roles"
  on user_roles for select
  to authenticated
  using (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3');

create policy "Admins can insert roles"
  on user_roles for insert
  to authenticated
  with check (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3');

create policy "Admins can update roles"
  on user_roles for update
  to authenticated
  using (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3');

create policy "Admins can delete roles"
  on user_roles for delete
  to authenticated
  using (auth.uid() = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3');
