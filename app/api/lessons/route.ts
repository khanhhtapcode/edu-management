import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createLesson } from "@/lib/services/lesson-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const lesson = await createLesson(body)
    revalidatePath("/attendance")
    revalidatePath("/lessons")
    revalidatePath("/")
    return ok(lesson, 201)
  } catch (error) {
    return handleError(error)
  }
}
