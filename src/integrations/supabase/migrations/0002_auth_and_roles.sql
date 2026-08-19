-- Tạo bảng user_roles để phân quyền
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'customer')),
  created_at timestamp with time zone default now(),
  unique(user_id)
);

-- Bật RLS
alter table user_roles enable row level security;

-- Policies cho user_roles
create policy "Users can view their own role"
  on user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on user_roles for select
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert roles"
  on user_roles for insert
  to authenticated
  with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update roles"
  on user_roles for update
  to authenticated
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Function để tự động tạo customer role khi user đăng ký
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger để tự động gán role customer cho user mới
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tạo admin user (chạy sau khi đã có user đăng ký)
-- update user_roles set role = 'admin' where user_id = 'user-uuid-here';
