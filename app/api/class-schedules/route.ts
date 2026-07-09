import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError, ApiError } from "@/lib/api"
import { getClassSchedules, setClassSchedule } from "@/lib/services/class-schedule-service"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const classId = request.nextUrl.searchParams.get("classId")
    if (!classId) throw new ApiError(400, "Thiếu classId")
    const schedules = await getClassSchedules(classId)
    return ok(schedules)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const schedules = await setClassSchedule(body)
    revalidatePath("/schedule")
    return ok(schedules, 201)
  } catch (error) {
    return handleError(error)
  }
}
