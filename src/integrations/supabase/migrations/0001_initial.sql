-- Tạo bảng sản phẩm
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10, 2) not null,
  image_url text,
  category text,
  stock int default 0,
  is_featured boolean default false,
  created_at timestamp with time zone default now()
);

-- Tạo bảng giỏ hàng
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity int not null default 1,
  created_at timestamp with time zone default now()
);

-- Tạo bảng đơn hàng
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  total_amount decimal(10, 2) not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Tạo bảng chi tiết đơn hàng
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  price decimal(10, 2) not null,
  created_at timestamp with time zone default now()
);

-- Bật RLS cho tất cả bảng
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies cho products (public read)
create policy "Ai cũng có thể xem sản phẩm"
  on products for select
  to public
  using (true);

-- Policies cho cart_items
create policy "Người dùng có thể xem giỏ hàng của mình"
  on cart_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Người dùng có thể thêm vào giỏ hàng"
  on cart_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Người dùng có thể cập nhật giỏ hàng của mình"
  on cart_items for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Người dùng có thể xóa khỏi giỏ hàng"
  on cart_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies cho orders
create policy "Người dùng có thể xem đơn hàng của mình"
  on orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Người dùng có thể tạo đơn hàng"
  on orders for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Policies cho order_items
create policy "Người dùng có thể xem chi tiết đơn hàng của mình"
  on order_items for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
