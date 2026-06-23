import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import {
  addStudentToLesson,
  removeStudentFromLesson,
} from "@/lib/services/attendance-service"

// Thêm học sinh vào buổi học
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const { lessonId, studentId } = await request.json()
    const result = await addStudentToLesson(lessonId, studentId)
    revalidatePath("/schedule")
    revalidatePath("/lessons")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(result, 201)
  } catch (error) {
    return handleError(error)
  }
}

// Bỏ học sinh khỏi buổi học
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId") ?? ""
    const studentId = searchParams.get("studentId") ?? ""
    const result = await removeStudentFromLesson(lessonId, studentId)
    revalidatePath("/schedule")
    revalidatePath("/lessons")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
