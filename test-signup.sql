-- Test signup manually via SQL
-- Chay trong SQL Editor de kiem tra

-- Kiem tra settings
SELECT * FROM auth.users LIMIT 1;

-- Kiem tra xem email da ton tai chua
SELECT * FROM auth.users WHERE email = 'admin@florist.com';

-- Test tao user manual (neu can)
-- INSERT INTO auth.users (email, email_confirmed_at) 
-- VALUES ('test@example.com', NOW());
