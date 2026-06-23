# EduTrack — Hệ thống quản lý lớp học & học sinh

Ứng dụng quản lý trung tâm giáo dục: học sinh, ca học, điểm danh, nhật ký bài học và xuất phiếu báo cáo tháng (PDF/Excel) cho phụ huynh.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix Primitives) — theme *Education Modern* (Indigo)
- **Prisma 6** ORM — **PostgreSQL** (Neon)
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

1. **Dashboard** — 4 KPI cards + bộ lọc động (thời gian / lớp / ca) + biểu đồ phân bố điểm danh (Có mặt / Vắng) & tỷ lệ chuyên cần theo lớp.
2. **Học sinh** — CRUD, tìm kiếm debounce, lọc theo lớp/trạng thái, sửa qua Sheet, **soft delete**. Quản lý lớp học kèm theo.
3. **Thời khóa biểu** — lưới Ca × Ngày theo tuần (điều hướng tuần trước/này/sau). Mỗi ô là 1 buổi của 1 lớp; **điểm danh inline** ngay trên lịch (bấm badge: Chưa điểm → Có mặt → Vắng). Thêm buổi, thêm/bớt học sinh (+ Thêm HS), thêm ca học.
4. **Nhật ký bài học** — nội dung chung (chủ đề, kiến thức, bài tập) + bảng đánh giá cá nhân inline-editable theo buổi.
5. **Báo cáo & PDF** — thống kê chuyên cần (Có mặt/Vắng), biểu đồ tròn + radar, lưu snapshot, **xuất PDF A4** + **xuất Excel**, lịch sử báo cáo.

> Điểm danh **2 trạng thái**: Có mặt / Vắng, thực hiện trực tiếp trên Thời khóa biểu (không còn màn điểm danh riêng).

## Bắt đầu

```bash
# 1. Cài dependencies (đã cài sẵn)
npm install

# 2. Cấu hình .env với chuỗi kết nối Neon (xem mục dưới)

# 3. Tạo bảng trên Neon & seed dữ liệu mẫu
npm run db:push        # hoặc: npm run db:migrate -- --name init
npm run db:seed

# 4. Chạy dev
npm run dev
```

Mở http://localhost:3000 — đăng nhập với **admin / admin123**.

## Biến môi trường (`.env`)

```
DATABASE_URL="postgresql://USER:PASS@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="..."          # đổi trong production
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

## Deploy database lên Neon

1. Tạo project trên [neon.tech](https://neon.tech) → mở **Connection Details**.
2. Copy **2 chuỗi kết nối** vào `.env`:
   - `DATABASE_URL` = chuỗi **Pooled** (host có `-pooler`) — dùng cho app runtime.
   - `DIRECT_URL` = chuỗi **Direct** (không `-pooler`) — dùng cho migrate.
   - Giữ nguyên `?sslmode=require`.
3. Đẩy schema & dữ liệu mẫu:
   ```bash
   npm run db:migrate -- --name init   # tạo migration (dùng DIRECT_URL)
   npm run db:seed
   ```
   > Hoặc nhanh hơn không cần file migration: `npm run db:push`.
4. Trên nền tảng deploy (Vercel...), set các biến env tương tự và chạy
   `npm run db:deploy` (prisma migrate deploy) khi build/release.

> Lưu ý: `lib/db.ts` đã dùng singleton PrismaClient. Với Neon serverless,
> luôn trỏ runtime tới chuỗi **pooled** để tránh cạn kết nối.

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run db:push` | Đồng bộ schema vào DB (không tạo file migration) |
| `npm run db:migrate` | Tạo & áp migration (dev) |
| `npm run db:deploy` | Áp migration (production) |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio |
