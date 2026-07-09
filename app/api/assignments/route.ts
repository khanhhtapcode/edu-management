import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireRole, ok, handleError, ApiError } from "@/lib/api"
import {
  createAssignment,
  type NewAssignmentFile,
} from "@/lib/services/assignment-service"

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin")

    const form = await request.formData()
    const classId = String(form.get("classId") ?? "")
    const title = String(form.get("title") ?? "")
    const description = form.get("description")
      ? String(form.get("description"))
      : null
    const dueDate = form.get("dueDate") ? String(form.get("dueDate")) : null

    const rawFiles = form.getAll("files").filter((f): f is File => f instanceof File)
    if (rawFiles.length === 0) {
      throw new ApiError(400, "Vui lòng đính kèm ít nhất một file bài tập")
    }

    const files: NewAssignmentFile[] = await Promise.all(
      rawFiles.map(async (f) => ({
        fileName: f.name,
        mimeType: f.type || "application/octet-stream",
        size: f.size,
        data: new Uint8Array(await f.arrayBuffer()),
      }))
    )

    const assignment = await createAssignment({
      classId,
      title,
      description,
      dueDate,
      files,
    })
    revalidatePath("/assignments")
    revalidatePath("/student")
    return ok(assignment, 201)
  } catch (error) {
    return handleError(error)
  }
}
