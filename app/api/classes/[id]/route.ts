import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateClass, deleteClass } from "@/lib/services/class-service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const cls = await updateClass(id, body)
    revalidatePath("/students")
    return ok(cls)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const result = await deleteClass(id)
    revalidatePath("/students")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
