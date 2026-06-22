import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const { pathname } = req.nextUrl

  const isLoginPage = pathname === "/login"
  const isApiRoute =
    pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")

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

  // Đã đăng nhập mà vào /login -> về dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  // Chặn tất cả trừ static, image, favicon và auth api
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|jpg|jpeg|png|webp|ico)).*)",
  ],
}
