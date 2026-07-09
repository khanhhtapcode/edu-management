import { NextRequest } from "next/server"
import { requireAuth, handleError, ApiError } from "@/lib/api"
import { getAssignmentFile } from "@/lib/services/assignment-service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const file = await getAssignmentFile(id)

    // Học sinh chỉ được tải file của lớp mình
    if (
      session.user.role === "student" &&
      session.user.classId !== file.assignment.classId
    ) {
      throw new ApiError(403, "Bạn không có quyền tải file này")
    }

    const body = new Uint8Array(file.data)
    return new Response(body, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          file.fileName
        )}`,
        "Content-Length": String(body.byteLength),
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
