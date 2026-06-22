import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateLesson, deleteLesson } from "@/lib/services/lesson-service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const lesson = await updateLesson(id, body)
    revalidatePath("/attendance")
    revalidatePath("/lessons")
    return ok(lesson)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const result = await deleteLesson(id)
    revalidatePath("/attendance")
    revalidatePath("/lessons")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
