import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createOrUpdateReport } from "@/lib/services/report-service"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const report = await createOrUpdateReport(body)
    revalidatePath("/reports")
    return ok(report, 201)
  } catch (error) {
    return handleError(error)
  }
}
