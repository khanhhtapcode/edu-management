import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { setAttendance } from "@/lib/services/attendance-service"

// Điểm danh 1 học sinh (inline trên thời khóa biểu)
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const result = await setAttendance(body)
    revalidatePath("/schedule")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
