# ProtectedRoute - Hệ thống Authorization

Hệ thống bảo vệ routes dựa trên role của user, đảm bảo các role khác nhau không thể truy cập vào trang của nhau.

## Các Components

### 1. ProtectedRoute
Component cơ bản để bảo vệ routes dựa trên role.

**Props:**
- `children`: ReactNode - Component con cần được bảo vệ
- `allowedRoles`: UserRole[] - Mảng các role được phép truy cập
- `redirectTo?`: string - Route để redirect nếu không có quyền (mặc định: `/login`)

**Ví dụ:**
```tsx
<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.HOSTELOWNER]}>
  <MyComponent />
</ProtectedRoute>
```

### 2. AdminRoute
Chỉ cho phép ADMIN truy cập.

**Ví dụ:**
```tsx
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### 3. HostelOwnerRoute
Chỉ cho phép HOSTELOWNER hoặc HOSTEL_OWNER truy cập.

**Ví dụ:**
```tsx
<HostelOwnerRoute>
  <HostelOwnerDashboard />
</HostelOwnerRoute>
```

### 4. PublicRoute
Cho phép tất cả user truy cập, kể cả chưa đăng nhập.

**Props:**
- `children`: ReactNode
- `redirectIfAuthenticated?`: string - Redirect nếu đã đăng nhập (dùng cho login/register)

**Ví dụ:**
```tsx
// Public route bình thường
<PublicRoute>
  <HomePage />
</PublicRoute>

// Public route nhưng redirect nếu đã đăng nhập (cho login/register)
<PublicRoute redirectIfAuthenticated="dashboard">
  <Login />
</PublicRoute>
```

### 5. GuestRoute
Cho phép tất cả role truy cập (đã đăng nhập).

**Props:**
- `children`: ReactNode
- `allowAuthenticated?`: boolean - Cho phép user đã đăng nhập (mặc định: true)

## Cách sử dụng trong App.tsx

```tsx
import { AdminRoute, HostelOwnerRoute, PublicRoute } from './components/ProtectedRoute'

// Public routes
<Route 
  path="/" 
  element={
    <PublicRoute>
      <GuestLayout><Home /></GuestLayout>
    </PublicRoute>
  } 
/>

<Route 
  path="/login" 
  element={
    <PublicRoute redirectIfAuthenticated="dashboard">
      <GuestLayout><Login /></GuestLayout>
    </PublicRoute>
  } 
/>

// Admin routes
<Route 
  path="/admin/dashboard" 
  element={
    <AdminRoute>
      <Layout><AdminDashboard /></Layout>
    </AdminRoute>
  } 
/>

// Hostel Owner routes
<Route 
  path="/owner/dashboard" 
  element={
    <HostelOwnerRoute>
      <Layout><OwnerDashboard /></Layout>
    </HostelOwnerRoute>
  } 
/>
```

## Logic hoạt động

1. **Kiểm tra Authentication:**
   - Nếu chưa đăng nhập → Redirect về `/login` (hoặc `redirectTo`)
   - Nếu đã đăng nhập → Tiếp tục kiểm tra role

2. **Kiểm tra Role:**
   - Nếu role không trong `allowedRoles` → Redirect về dashboard phù hợp:
     - ADMIN → `/admin/dashboard`
     - HOSTELOWNER/HOSTEL_OWNER → `/owner/dashboard`
     - Khác → `/`

3. **PublicRoute:**
   - Cho phép tất cả user truy cập
   - Nếu `redirectIfAuthenticated` được set và user đã đăng nhập → Redirect về dashboard phù hợp

## Các Role trong hệ thống

- `ADMIN`: Quản trị viên
- `HOSTELOWNER` / `HOSTEL_OWNER`: Chủ nhà trọ
- `GUEST`: Khách hàng
- `CUSTOMER`: Khách hàng (alias)

## Lưu ý

- Tất cả routes đều được bảo vệ, không có route nào có thể truy cập mà không qua kiểm tra
- User sẽ được redirect tự động về dashboard phù hợp với role của họ nếu cố truy cập route không được phép
- Loading state được hiển thị khi đang kiểm tra authentication

