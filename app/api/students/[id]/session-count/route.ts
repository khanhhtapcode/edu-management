import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { resetSessionCount } from "@/lib/services/attendance-service"

type Params = { params: Promise<{ id: string }> }

// Reset bộ đếm số buổi học của học sinh về 0
export async function POST(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth()
    const { id } = await params
    const student = await resetSessionCount(id)
    revalidatePath("/students")
    return ok(student)
  } catch (error) {
    return handleError(error)
  }
}
