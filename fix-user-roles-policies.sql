-- Fix infinite recursion in user_roles RLS policies
-- Chay trong SQL Editor de sua policies

-- Xoa policies cu
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Tao policies moi - khong co recursion
create policy "Users can view their own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on user_roles for select
  to authenticated
  using (
    -- Kiem tra user co admin role khong - khong tu tham chieu
    auth.uid() IN (
      select user_id from auth.users 
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "Admins can insert roles"
  on user_roles for insert
  to authenticated
  with check (
    -- Chi admin moi co quyen insert
    auth.uid() IN (
      select user_id from auth.users 
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "Admins can update roles"
  on user_roles for update
  to authenticated
  using (
    auth.uid() IN (
      select user_id from auth.users 
      where raw_user_meta_data->>'role' = 'admin'
    )
  );

create policy "Admins can delete roles"
  on user_roles for delete
  to authenticated
  using (
    auth.uid() IN (
      select user_id from auth.users 
      where raw_user_meta_data->>'role' = 'admin'
    )
  );
