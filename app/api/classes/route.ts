import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createClass } from "@/lib/services/class-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const cls = await createClass(body)
    revalidatePath("/students")
    return ok(cls, 201)
  } catch (error) {
    return handleError(error)
  }
}
