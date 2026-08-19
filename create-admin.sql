-- Gán role admin cho user
-- User UUID: 2a7ac1ee-ddd1-4034-b21b-4095cec28be3

-- Cập nhật role thành admin
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = '2a7ac1ee-ddd1-4034-b21b-4095cec28be3';

-- Nếu user chưa có trong user_roles, dùng INSERT:
INSERT INTO user_roles (user_id, role) 
VALUES ('2a7ac1ee-ddd1-4034-b21b-4095cec28be3', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Kiểm tra kết quả:
SELECT * FROM user_roles WHERE role = 'admin';
