# Hướng dẫn thiết lập Admin Role

## 1. Cập nhật Database

Chạy file migration SQL để thêm role ADMIN và field IsActive:

```sql
-- Chạy file: Database/admin_migration.sql
```

Hoặc chạy các lệnh sau trong SQL Server:

```sql
USE [HostelRentalDB]
GO

-- Drop existing constraint on Role
ALTER TABLE [dbo].[Users] DROP CONSTRAINT [CK__Users__Role__267ABA7A]
GO

-- Add IsActive column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'IsActive')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [IsActive] [bit] NOT NULL DEFAULT(1)
END
GO

-- Add new constraint to allow ADMIN role
ALTER TABLE [dbo].[Users] ADD CONSTRAINT [CK_Users_Role] CHECK (([Role]='ADMIN' OR [Role]='HOSTELOWNER' OR [Role]='GUEST'))
GO
```

## 2. Tạo tài khoản Admin

Sau khi cập nhật database, bạn có thể tạo tài khoản admin bằng cách:

1. Đăng ký tài khoản mới với role ADMIN (qua API hoặc trực tiếp trong database)
2. Hoặc cập nhật một tài khoản hiện có thành ADMIN:

```sql
UPDATE Users SET Role = 'ADMIN' WHERE Email = 'admin@example.com'
```

## 3. Cấu hình Frontend

Đảm bảo file `.env` trong thư mục `FE` có cấu hình:

```
VITE_API_BASE_URL=http://localhost:8080/HostelManagement
```

(Thay đổi port và context path tùy theo cấu hình server của bạn)

## 4. Các chức năng Admin

### Quản lý tài khoản (`/admin/users`)
- Xem danh sách tất cả người dùng
- Chỉnh sửa thông tin người dùng (tên, email, số điện thoại, role, số dư)
- Đổi mật khẩu người dùng
- Kích hoạt/Vô hiệu hóa tài khoản

### Quản lý đánh giá (`/admin/reviews`)
- Xem danh sách tất cả đánh giá/bình luận
- Xóa đánh giá không phù hợp

### Quản lý nhà trọ (`/admin/hostels`)
- Xem danh sách tất cả nhà trọ
- Xóa nhà trọ

## 5. API Endpoints

### Admin Endpoints (yêu cầu role ADMIN)

- `GET /api/admin` - Lấy thống kê dashboard
- `GET /api/admin/users` - Lấy danh sách tất cả người dùng
- `GET /api/admin/users/{id}` - Lấy thông tin người dùng theo ID
- `PUT /api/admin/users/{id}` - Cập nhật thông tin người dùng
- `POST /api/admin/users/{id}/password` - Đổi mật khẩu người dùng
- `PUT /api/admin/users/{id}/activate` - Kích hoạt tài khoản
- `PUT /api/admin/users/{id}/deactivate` - Vô hiệu hóa tài khoản
- `GET /api/admin/reviews` - Lấy danh sách tất cả đánh giá
- `GET /api/admin/reviews/{id}` - Lấy thông tin đánh giá theo ID
- `DELETE /api/admin/reviews/{id}` - Xóa đánh giá
- `GET /api/admin/hostels` - Lấy danh sách tất cả nhà trọ
- `GET /api/admin/hostels/{id}` - Lấy thông tin nhà trọ theo ID
- `DELETE /api/admin/hostels/{id}` - Xóa nhà trọ

Tất cả các endpoints yêu cầu header:
```
Authorization: Bearer <token>
```

## 6. Bảo mật

- Tất cả các admin endpoints đều kiểm tra quyền ADMIN
- Chỉ người dùng có role ADMIN mới có thể truy cập các chức năng quản lý
- Token được validate trước khi cho phép truy cập

