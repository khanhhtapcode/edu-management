---
inclusion: always
---

# Next.js App Router — Conventions & Coding Patterns

> Áp dụng cho toàn bộ dự án này. Mọi file, folder và pattern phải tuân thủ đúng chuẩn dưới đây.

---

## KIẾN TRÚC DỰ ÁN (ƯU TIÊN CAO NHẤT)

> ⚠️ Dự án này **KHÔNG dùng Server Actions cho mutation**. Đã migrate sang **REST API + Service Layer**.

### Luồng dữ liệu

- **ĐỌC dữ liệu**: Server Component gọi `db` (Prisma) **trực tiếp** trong `page.tsx`. Không tạo `GET` route, không `fetch` ở client.
- **GHI dữ liệu (create/update/delete)**: Client Component → `apiFetch()` → Route Handler (`app/api/.../route.ts`) → Service (`lib/services/*`) → Prisma.

### Phân tầng bắt buộc

| Tầng | File | Trách nhiệm |
|------|------|-------------|
| **Route Handler** | `app/api/<resource>/route.ts` | Chỉ lo HTTP: `requireAuth()` → đọc body → gọi service → `revalidatePath()` → `ok()`. Bọc trong `try/catch` → `handleError(error)`. **KHÔNG** chứa logic nghiệp vụ. |
| **Service** | `lib/services/<resource>-service.ts` | Toàn bộ logic nghiệp vụ + validation. Ném `ApiError(status, message)` khi dữ liệu sai. Trả về entity. |
| **Helper API** | `lib/api.ts` | `ApiError`, `requireAuth()`, `ok()`, `handleError()`. |
| **Client helper** | `lib/api-client.ts` | `apiFetch(url, { method, body })` — tự serialize JSON, ném `Error(message)` khi response không OK. |
| **Hằng số** | `lib/constants.ts` | Tất cả magic values/status strings. Không hardcode rải rác. |

### Cấu trúc thư mục thực tế

```
app/
├── (dashboard)/                 # Route group — các trang quản trị (đọc db trực tiếp)
│   ├── members/page.tsx
│   ├── members/_components/*.tsx # Form client gọi apiFetch
│   ├── funds/ matches/ expenses/ jerseys/ schedule/
│   ├── layout.tsx  loading.tsx  error.tsx
│   └── page.tsx                  # Dashboard tổng quan
├── api/                         # REST API cho MUTATION (POST/PATCH/DELETE)
│   ├── members/route.ts  members/[id]/route.ts
│   ├── funds/route.ts  funds/bulk/route.ts
│   ├── matches/ expenses/ jerseys/ schedules/
│   └── auth/[...nextauth]/route.ts
└── login/page.tsx
lib/
├── api.ts            # ApiError, requireAuth, ok, handleError
├── api-client.ts     # apiFetch (client)
├── services/*.ts     # Logic nghiệp vụ + validation
├── constants.ts      # FUND_AMOUNT, FUND_STATUS, MEMBER_STATUS
├── auth.ts  db.ts  utils.ts
└── actions/auth.ts   # signIn/signOut (ngoại lệ duy nhất dùng Server Action)
```

---

## ROUTE HANDLER — Pattern chuẩn

```ts
// app/api/members/route.ts
import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createMember } from "@/lib/services/member-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()                     // 1. Xác thực bắt buộc
    const body = await request.json()       // 2. Đọc body
    const member = await createMember(body) // 3. Gọi service
    revalidatePath("/members")              // 4. Revalidate
    return ok(member, 201)                  // 5. Trả về
  } catch (error) {
    return handleError(error)
  }
}
```

---

## SERVICE — Quy tắc

- Mọi validation (NaN, Invalid Date, range, trùng lặp) nằm ở service, ném `ApiError(400/404/409, "...")`.
- Service là hàm thuần — không `"use server"`, không `revalidatePath`.
- Service có thể được gọi trực tiếp từ Server Component khi cần.

---

## CLIENT FORM — Pattern chuẩn

```tsx
"use client"
import { apiFetch } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

export function MyForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function onSubmit(data: FormData) {
    startTransition(async () => {
      try {
        await apiFetch("/api/resource", { method: "POST", body: { /* ... */ } })
        toast.success("Thành công")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }
}
```

- Luôn bắt lỗi bằng `error instanceof Error` — **KHÔNG** dùng `catch (error: any)`.
- Sau mutation gọi `router.refresh()` để làm tươi Server Component.

---

## SERVER vs CLIENT COMPONENTS

- **Mặc định tất cả component trong `app/` là Server Components.**
- Chỉ thêm `'use client'` khi cần: `useState`, `useEffect`, event handlers, browser APIs.
- Server Component **có thể import** Client Component.
- Client Component **KHÔNG thể import** Server Component — dùng `children` prop thay thế.
- Đẩy `'use client'` boundary **xuống thấp nhất có thể**.

---

## CÁC FILE ĐẶC BIỆT

| File | Extension | Ghi chú quan trọng |
|------|-----------|-------------------|
| `layout` | `.tsx` | Root layout BẮT BUỘC có `<html>` và `<body>` |
| `page` | `.tsx` | Bắt buộc để route được public |
| `loading` | `.tsx` | React Suspense boundary |
| `error` | `.tsx` | **BẮT BUỘC `'use client'`** |
| `global-error` | `.tsx` | **BẮT BUỘC có `<html>` và `<body>`** |
| `route` | `.ts` | **KHÔNG đặt chung segment với `page.tsx`** |

---

## DYNAMIC PARAMS (Next.js 15+)

```tsx
// params là Promise trong Next.js 15+
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params  // BẮT BUỘC await
  // ...
}
```

---

## AUTH

- Hệ thống dùng **1 tài khoản superadmin** qua env (`ADMIN_USERNAME`/`ADMIN_PASSWORD`), NextAuth Credentials.
- Không có self-register/đa người dùng.
- Middleware đã chặn toàn bộ route (trừ `/login`, static). Route handler vẫn phải `requireAuth()`.

---

## CHECKLIST TRƯỚC KHI TẠO/SỬA FILE

- [ ] Tên file đúng convention? (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`)
- [ ] Component có cần `'use client'`? Hooks/events → có. Chỉ render/fetch → không.
- [ ] `error.tsx` có `'use client'`?
- [ ] Root layout có `<html>` và `<body>`?
- [ ] `global-error.tsx` có `<html>` và `<body>`?
- [ ] `route.ts` không nằm chung segment với `page.tsx`?
- [ ] Dynamic params dùng `await params`? (Next.js 15+)
- [ ] Mutation đi qua Route Handler → Service, không dùng Server Action?
- [ ] `revalidatePath()` được gọi TRƯỚC `redirect()`?
- [ ] Không hardcode magic values — dùng `lib/constants.ts`?

---

## ANTI-PATTERNS CẦN TRÁNH

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Dùng Server Action cho mutation | Dùng Route Handler + Service |
| Logic nghiệp vụ trong Route Handler | Chuyển vào Service |
| `catch (error: any)` | `error instanceof Error` |
| `useEffect` để fetch initial data | Fetch trong Server Component async |
| Import Server Component vào Client Component | Truyền qua `children` prop |
| `page.tsx` và `route.ts` cùng segment | Tách ra segment khác nhau |
| `redirect()` trước `revalidatePath()` | `revalidatePath()` trước, `redirect()` sau |
| Quên `await params` trong Next.js 15+ | `const { slug } = await params` |
| `error.tsx` không có `'use client'` | Bắt buộc là Client Component |
| Hardcode status strings | Dùng constants từ `lib/constants.ts` |
