import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import {
  updateStudent,
  deleteStudent,
} from "@/lib/services/student-service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const student = await updateStudent(id, body)
    revalidatePath("/students")
    revalidatePath("/schedule")
    revalidatePath("/lessons")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(student)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const result = await deleteStudent(id)
    revalidatePath("/students")
    revalidatePath("/schedule")
    revalidatePath("/lessons")
    revalidatePath("/reports")
    revalidatePath("/")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
