import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import {
  assignStudentsToShift,
  removeStudentFromShift,
} from "@/lib/services/shift-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const result = await assignStudentsToShift(body)
    revalidatePath("/shifts")
    revalidatePath("/students")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") ?? ""
    const result = await removeStudentFromShift(studentId)
    revalidatePath("/shifts")
    revalidatePath("/students")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
