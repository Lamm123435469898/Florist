-- Add sample data for testing
-- Chay trong SQL Editor

-- Them sample product
INSERT INTO products (name, description, price, image_url, category, stock)
VALUES 
  ('Rose Bouquet', 'Beautiful red roses', 29.99, 'https://images.unsplash.com/photo-1518709596971-e8b0c675c952', 'flowers', 50),
  ('Tulip Garden', 'Fresh tulips from Holland', 39.99, 'https://images.unsplash.com/photo-1518709596971-e8b0c675c952', 'flowers', 30),
  ('Orchid Plant', 'Elegant white orchid', 49.99, 'https://images.unsplash.com/photo-1518709596971-e8b0c675c952', 'plants', 20);

-- Them sample order
INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status)
VALUES 
  ('2a7ac1ee-ddd1-4034-b21b-4095cec28be3', 'Admin User', 'admin@florist.com', '1234567890', '123 Main St, City, Country', 69.98, 'pending');
