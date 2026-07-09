import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { authConfig } from "@/lib/auth.config"
import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Tài khoản", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined
        if (!username || !password) return null

        // 1. Superadmin qua env
        const adminUser = process.env.ADMIN_USERNAME ?? "admin"
        const adminPass = process.env.ADMIN_PASSWORD ?? "admin123"
        if (username === adminUser && password === adminPass) {
          return {
            id: "superadmin",
            name: "Quản trị viên",
            email: `${adminUser}@edutrack.local`,
            role: "admin",
          }
        }

        // 2. Học sinh có tài khoản trong DB
        const student = await db.student.findUnique({ where: { username } })
        if (
          !student ||
          !student.password ||
          student.status !== MEMBER_STATUS.ACTIVE
        ) {
          return null
        }
        const valid = await bcrypt.compare(password, student.password)
        if (!valid) return null

        return {
          id: student.id,
          name: student.fullName,
          role: "student",
          studentId: student.id,
          classId: student.classId,
        }
      },
    }),
  ],
})
