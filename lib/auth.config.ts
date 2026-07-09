import type { NextAuthConfig } from "next-auth"

/**
 * Cấu hình NextAuth dùng chung, KHÔNG import Prisma/bcrypt để an toàn ở edge
 * runtime (proxy.ts). Provider có `authorize` truy vấn DB được thêm ở lib/auth.ts
 * (chạy trên Node runtime khi xử lý /api/auth).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
    // Đẩy role + studentId + classId vào token khi đăng nhập
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
        token.classId = user.classId
      }
      return token
    },
    // Phơi role + studentId + classId ra session cho server/client dùng
    session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "admin" | "student") ?? "admin"
        session.user.studentId = token.studentId as string | undefined
        session.user.classId = token.classId as string | undefined
      }
      return session
    },
  },
} satisfies NextAuthConfig
