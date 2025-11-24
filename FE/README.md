# Hostel Management - Frontend

Ứng dụng quản lý trọ được xây dựng bằng React + TypeScript

## Công nghệ sử dụng

- React 18
- TypeScript
- Vite
- React Router DOM
- Axios (HTTP client)
- JSON Server (Mock API)

## Cài đặt

```bash
npm install
```

## Chạy dự án

### Chạy JSON Server (Mock API)
```bash
npm run server
```
Server sẽ chạy tại `http://localhost:3000`

### Chạy Frontend
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:5173`

## Tài khoản mẫu

### Chủ Trọ (Hostel Owner)
- Username: `owner`
- Password: `owner123`

### Khách Thuê (Customer)
- Username: `customer`
- Password: `customer123`

## Build cho production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── api/           # API functions và axios config
│   ├── axios.ts   # Axios instance với interceptors
│   ├── auth.ts    # Authentication API
│   ├── rooms.ts   # Rooms API
│   ├── tenants.ts # Tenants API
│   └── types.ts   # API response types
├── components/     # Các component tái sử dụng
│   ├── Layout/
│   └── Navbar/
├── contexts/       # React Contexts
│   └── AuthContext.tsx
├── pages/         # Các trang chính
│   ├── Home/
│   ├── Rooms/
│   ├── Tenants/
│   ├── Login/
│   ├── HostelOwnerDashboard/
│   └── CustomerDashboard/
├── types/         # TypeScript types và interfaces
├── App.tsx        # Component chính
└── main.tsx       # Entry point
```

## Cấu hình API

Tạo file `.env` trong thư mục FE với nội dung:

```
VITE_API_BASE_URL=http://localhost:3000
```

Thay đổi URL phù hợp với backend của bạn.

## Tính năng

- [x] Trang chủ
- [x] Đăng nhập với 2 role (Hostel Owner và Customer)
- [x] Dashboard cho từng role
- [x] Quản lý phòng trọ (đang phát triển)
- [x] Quản lý khách thuê (đang phát triển)
- [x] JSON Server để mock API
