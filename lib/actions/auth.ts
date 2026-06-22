"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function login(username: string, password: string) {
  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    return { success: true as const }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, message: "Sai tài khoản hoặc mật khẩu" }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}
