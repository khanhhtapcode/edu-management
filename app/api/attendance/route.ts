import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { saveAttendance } from "@/lib/services/attendance-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const result = await saveAttendance(body)
    revalidatePath("/attendance")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
