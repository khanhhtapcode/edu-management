import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/** Lỗi nghiệp vụ có status code, ném từ service layer. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

/** Bắt buộc đã đăng nhập. Ném ApiError(401) nếu chưa. */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new ApiError(401, "Bạn cần đăng nhập để thực hiện thao tác này")
  }
  return session
}

/** Trả response thành công. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/** Map lỗi -> response. ApiError giữ status, còn lại 500. */
export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status })
  }
  console.error("[API_ERROR]", error)
  const message =
    error instanceof Error ? error.message : "Lỗi máy chủ không xác định"
  return NextResponse.json({ message }, { status: 500 })
}
