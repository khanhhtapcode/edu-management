import type { DefaultSession } from "next-auth"

type AppRole = "admin" | "student"

declare module "next-auth" {
  interface Session {
    user: {
      role: AppRole
      studentId?: string
      classId?: string
    } & DefaultSession["user"]
  }

  interface User {
    role: AppRole
    studentId?: string
    classId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: AppRole
    studentId?: string
    classId?: string
  }
}
