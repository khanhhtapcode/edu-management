import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { studentSchema } from "@/lib/validations"
import { MEMBER_STATUS } from "@/lib/constants"

function parseStudentData(input: unknown, partial = false) {
  const schema = partial ? studentSchema.partial() : studentSchema
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const data = parsed.data as Record<string, unknown>

  // Chuẩn hóa ngày sinh
  if (typeof data.dateOfBirth === "string") {
    const d = new Date(data.dateOfBirth)
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "Ngày sinh không hợp lệ")
    }
    data.dateOfBirth = d
  }
  // shiftId rỗng -> null
  if (data.shiftId === "" || data.shiftId === undefined) {
    data.shiftId = null
  }
  return data
}

export async function createStudent(input: unknown) {
  const data = parseStudentData(input)

  const cls = await db.class.findUnique({ where: { id: data.classId as string } })
  if (!cls) throw new ApiError(400, "Lớp học không tồn tại")

  return db.student.create({ data: data as never })
}

export async function updateStudent(id: string, input: unknown) {
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy học sinh")

  const data = parseStudentData(input, true)

  if (data.classId) {
    const cls = await db.class.findUnique({ where: { id: data.classId as string } })
    if (!cls) throw new ApiError(400, "Lớp học không tồn tại")
  }

  return db.student.update({ where: { id }, data: data as never })
}

/** Soft delete: chuyển trạng thái sang INACTIVE để bảo toàn lịch sử. */
export async function softDeleteStudent(id: string) {
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy học sinh")

  return db.student.update({
    where: { id },
    data: { status: MEMBER_STATUS.INACTIVE },
  })
}
