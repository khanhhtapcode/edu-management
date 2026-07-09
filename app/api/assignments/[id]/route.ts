import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireRole, ok, handleError } from "@/lib/api"
import { deleteAssignment } from "@/lib/services/assignment-service"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("admin")
    const { id } = await params
    const result = await deleteAssignment(id)
    revalidatePath("/assignments")
    revalidatePath("/student")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
