import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { classSchema } from "@/lib/validations"

export async function createClass(input: unknown) {
  const parsed = classSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  return db.class.create({ data: parsed.data })
}

export async function updateClass(id: string, input: unknown) {
  const existing = await db.class.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy lớp học")

  const parsed = classSchema.partial().safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  return db.class.update({ where: { id }, data: parsed.data })
}

export async function deleteClass(id: string) {
  const count = await db.student.count({ where: { classId: id } })
  if (count > 0) {
    throw new ApiError(409, "Không thể xóa lớp đang có học sinh")
  }
  await db.class.delete({ where: { id } })
  return { id }
}
