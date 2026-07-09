import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"

export type NewAssignmentFile = {
  fileName: string
  mimeType: string
  size: number
  data: Uint8Array
}

export type CreateAssignmentInput = {
  classId: string
  title: string
  description?: string | null
  dueDate?: string | null
  files: NewAssignmentFile[]
}

/** Danh sách bài tập của một lớp — KHÔNG lấy trường `data` (bytes) để tránh tải blob. */
export async function listAssignmentsByClass(classId: string) {
  return db.assignment.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      classId: true,
      title: true,
      description: true,
      dueDate: true,
      createdAt: true,
      files: {
        select: { id: true, fileName: true, mimeType: true, size: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function createAssignment(input: CreateAssignmentInput) {
  const title = input.title?.trim()
  if (!title) throw new ApiError(400, "Vui lòng nhập tiêu đề bài tập")

  const cls = await db.class.findUnique({ where: { id: input.classId } })
  if (!cls) throw new ApiError(400, "Lớp học không tồn tại")

  if (!input.files || input.files.length === 0) {
    throw new ApiError(400, "Vui lòng đính kèm ít nhất một file bài tập")
  }

  let dueDate: Date | null = null
  if (input.dueDate) {
    const d = new Date(input.dueDate)
    if (Number.isNaN(d.getTime())) throw new ApiError(400, "Hạn nộp không hợp lệ")
    dueDate = d
  }

  const assignment = await db.assignment.create({
    data: {
      classId: input.classId,
      title,
      description: input.description?.trim() || null,
      dueDate,
      files: {
        create: input.files.map((f) => ({
          fileName: f.fileName,
          mimeType: f.mimeType,
          size: f.size,
          data: f.data as never,
        })),
      },
    },
    select: { id: true },
  })

  return assignment
}

export async function deleteAssignment(id: string) {
  const existing = await db.assignment.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy bài tập")
  await db.assignment.delete({ where: { id } })
  return { id }
}

/** Lấy 1 file kèm bytes để tải; trả cả classId để kiểm quyền học sinh. */
export async function getAssignmentFile(fileId: string) {
  const file = await db.assignmentFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      data: true,
      assignment: { select: { classId: true } },
    },
  })
  if (!file) throw new ApiError(404, "Không tìm thấy file")
  return file
}
