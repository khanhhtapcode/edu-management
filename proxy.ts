import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

// Dùng config edge-safe (không kèm provider truy vấn DB) — chỉ đọc JWT.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const role = req.auth?.user?.role
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === "/login"
  const isApiRoute =
    pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")
  // Khớp đúng "/student" hoặc "/student/..." (KHÔNG dính "/students")
  const isStudentArea =
    pathname === "/student" || pathname.startsWith("/student/")
  // API mà học sinh được phép gọi: tải file bài tập
  const isStudentAllowedApi = pathname.startsWith("/api/assignments/files/")

  // API mutation: trả 401 JSON thay vì redirect HTML
  if (!isLoggedIn && isApiRoute) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập để thực hiện thao tác này" },
      { status: 401 }
    )
  }

  // Chưa đăng nhập -> ép về /login (trừ trang login)
  if (!isLoggedIn && !isLoginPage) {
    const url = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(url)
  }

  // Đã đăng nhập mà vào /login -> về trang chủ theo role
  if (isLoggedIn && isLoginPage) {
    const home = role === "student" ? "/student" : "/"
    return NextResponse.redirect(new URL(home, req.nextUrl.origin))
  }

  // Học sinh: chặn mọi API admin (chỉ cho phép tải file bài tập)
  if (isLoggedIn && role === "student" && isApiRoute && !isStudentAllowedApi) {
    return NextResponse.json(
      { message: "Bạn không có quyền thực hiện thao tác này" },
      { status: 403 }
    )
  }

  // Phân quyền khu vực trang
  if (isLoggedIn && !isApiRoute) {
    // Học sinh chỉ được ở /student/*
    if (role === "student" && !isStudentArea) {
      return NextResponse.redirect(new URL("/student", req.nextUrl.origin))
    }
    // Admin không vào khu vực học sinh
    if (role === "admin" && isStudentArea) {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  // Chặn tất cả trừ static, image, favicon và auth api
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|webp|ico)).*)",
  ],
}
