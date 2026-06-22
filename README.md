# EduTrack — Hệ thống quản lý lớp học & học sinh

Ứng dụng quản lý trung tâm giáo dục: học sinh, ca học, điểm danh, nhật ký bài học và xuất phiếu báo cáo tháng (PDF/Excel) cho phụ huynh.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix Primitives) — theme *Education Modern* (Indigo)
- **Prisma 6** ORM — mặc định **SQLite** cho dev (đổi sang PostgreSQL cho production)
- **NextAuth v5** (Credentials, 1 tài khoản superadmin)
- **Recharts** (biểu đồ tròn / cột / radar)
- **@react-pdf/renderer** (xuất PDF A4, hỗ trợ tiếng Việt) + **SheetJS/xlsx** (xuất Excel)
- **react-hook-form** + **zod** (validation form)

## Kiến trúc (REST API + Service Layer)

> Dự án **không dùng Server Actions cho mutation** (ngoại lệ duy nhất: đăng nhập/đăng xuất).

- **Đọc dữ liệu**: Server Component gọi Prisma (`db`) trực tiếp trong `page.tsx`.
- **Ghi dữ liệu**: Client → `apiFetch()` → Route Handler (`app/api/.../route.ts`) → Service (`lib/services/*`) → Prisma.

| Tầng | Vị trí |
|------|--------|
| Route Handler (HTTP) | `app/api/<resource>/route.ts` |
| Service (nghiệp vụ + validation) | `lib/services/*-service.ts` |
| Helper API | `lib/api.ts` (`ApiError`, `requireAuth`, `ok`, `handleError`) |
| Client helper | `lib/api-client.ts` (`apiFetch`) |
| Hằng số | `lib/constants.ts` |
| Validation | `lib/validations.ts` (zod) |

## Chức năng

1. **Dashboard** — 4 KPI cards + bộ lọc động (thời gian / lớp / ca) + biểu đồ phân bố điểm danh & tỷ lệ chuyên cần theo lớp.
2. **Học sinh** — CRUD, tìm kiếm debounce, lọc theo lớp/trạng thái, sửa qua Sheet, **soft delete** (chuyển INACTIVE). Quản lý lớp học kèm theo.
3. **Ca học** — CRUD ca, tạo nhanh 4 ca mẫu, gán/bỏ học sinh vào ca bằng checkbox.
4. **Điểm danh** — chọn buổi học → roster theo ca → toggle trạng thái một chạm (Có mặt / Vắng có phép / Vắng không phép / Đi muộn + số phút).
5. **Nhật ký bài học** — nội dung chung (chủ đề, kiến thức, bài tập) + bảng đánh giá cá nhân inline-editable.
6. **Báo cáo & PDF** — thống kê chuyên cần, biểu đồ tròn + radar, lưu snapshot báo cáo tháng, **xuất PDF A4** (upload logo) và **xuất Excel**, lịch sử báo cáo.

## Bắt đầu

```bash
# 1. Cài dependencies (đã cài sẵn)
npm install

# 2. Tạo DB & seed dữ liệu mẫu
npm run db:push
npm run db:seed

# 3. Chạy dev
npm run dev
```

Mở http://localhost:3000 — đăng nhập với **admin / admin123**.

## Biến môi trường (`.env`)

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="..."          # đổi trong production
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

## Chuyển sang PostgreSQL (production)

Trong `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"   // đổi từ "sqlite"
  url      = env("DATABASE_URL")
}
```

Thêm lại annotation `@db.Text` cho các trường nội dung dài (`coreKnowledge`, `classWork`,
`homework`, `attitude`, `reception`, `improvement`, `homeworkComment`, `teacherReview`),
cập nhật `DATABASE_URL` thành chuỗi kết nối Postgres, rồi chạy `npx prisma migrate dev`.

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run db:push` | Đồng bộ schema vào DB |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio |
