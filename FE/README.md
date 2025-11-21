# Hostel Management - Frontend

Ứng dụng quản lý trọ được xây dựng bằng React + TypeScript

## Công nghệ sử dụng

- React 18
- TypeScript
- Vite
- React Router DOM

## Cài đặt

```bash
npm install
```

## Chạy dự án

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build cho production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── components/     # Các component tái sử dụng
│   ├── Layout/
│   └── Navbar/
├── pages/         # Các trang chính
│   ├── Home/
│   ├── Rooms/
│   └── Tenants/
├── types/         # TypeScript types và interfaces
├── App.tsx        # Component chính
└── main.tsx       # Entry point
```

## Tính năng

- [x] Trang chủ
- [x] Quản lý phòng trọ (đang phát triển)
- [x] Quản lý khách thuê (đang phát triển)

