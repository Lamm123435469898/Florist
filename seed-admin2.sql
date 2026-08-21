-- Chạy đoạn script này trong SQL Editor của Supabase để tạo tài khoản admin2 ngay lập tức
DO $$
DECLARE
    admin_role_id uuid;
    admin2_id uuid := gen_random_uuid();
BEGIN
    -- Tìm ID của role ADMIN
    SELECT "Id" INTO admin_role_id FROM "Roles" WHERE "Name" = 'ADMIN' LIMIT 1;
    
    -- Nếu chưa có tài khoản admin2 thì tạo mới
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE "Email" = 'admin2@florist.com') THEN
        INSERT INTO "Users" ("Id", "Email", "FullName", "PhoneNumber", "PasswordHash")
        VALUES (
            admin2_id, 
            'admin2@florist.com', 
            'System Admin 2', 
            '0900000002', 
            '$2a$11$N94M1/3aZg3O./qT9/p.Fef7zK2qH3jV3p3bW8x1tM3eD.T/f1w.e'
        );
        
        -- Gán role admin cho tài khoản mới
        INSERT INTO "UserRoles" ("UserId", "RoleId")
        VALUES (admin2_id, admin_role_id);
    END IF;
END $$;
