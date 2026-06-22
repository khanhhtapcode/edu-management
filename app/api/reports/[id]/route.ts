import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { deleteReport } from "@/lib/services/report-service"

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const result = await deleteReport(id)
    revalidatePath("/reports")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
