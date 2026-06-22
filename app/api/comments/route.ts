import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { saveComments } from "@/lib/services/comment-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const result = await saveComments(body)
    revalidatePath("/lessons")
    revalidatePath("/reports")
    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}
