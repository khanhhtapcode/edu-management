import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Tài khoản", type: "text" },
        password: { label: "Mật khẩu", type: "password" },
      },
      authorize(credentials) {
        const username = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined

        const adminUser = process.env.ADMIN_USERNAME ?? "admin"
        const adminPass = process.env.ADMIN_PASSWORD ?? "admin123"

        if (username === adminUser && password === adminPass) {
          return {
            id: "superadmin",
            name: "Quản trị viên",
            email: `${adminUser}@edutrack.local`,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
})
