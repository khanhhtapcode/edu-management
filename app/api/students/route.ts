import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createStudent } from "@/lib/services/student-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const student = await createStudent(body)
    revalidatePath("/students")
    revalidatePath("/schedule")
    revalidatePath("/lessons")
    revalidatePath("/")
    return ok(student, 201)
  } catch (error) {
    return handleError(error)
  }
}
