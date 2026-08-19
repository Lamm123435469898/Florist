-- Thêm policy cho phép user (authenticated) được quyền INSERT vào bảng order_items
-- Kiểm tra xem order_id mà họ đang insert có thuộc về họ (trong bảng orders) hay không

CREATE POLICY "Người dùng có thể thêm chi tiết đơn hàng cho đơn hàng của mình"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
