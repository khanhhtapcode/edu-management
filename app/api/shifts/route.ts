import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createShift } from "@/lib/services/shift-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const shift = await createShift(body)
    revalidatePath("/shifts")
    return ok(shift, 201)
  } catch (error) {
    return handleError(error)
  }
}
