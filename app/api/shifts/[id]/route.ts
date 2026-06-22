import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateShift, deleteShift } from "@/lib/services/shift-service"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const shift = await updateShift(id, body)
    revalidatePath("/shifts")
    return ok(shift)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const result = await deleteShift(id)
    revalidatePath("/shifts")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
