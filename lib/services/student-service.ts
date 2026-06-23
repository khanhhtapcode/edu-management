import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { studentSchema } from "@/lib/validations"
import { MEMBER_STATUS } from "@/lib/constants"
import { parseLocalDate } from "@/lib/utils"
import { seedAttendanceForClassLessons } from "@/lib/services/attendance-service"

function parseStudentData(input: unknown, partial = false) {
  const schema = partial ? studentSchema.partial() : studentSchema
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const data = parsed.data as Record<string, unknown>

  if (typeof data.dateOfBirth === "string") {
    const d = parseLocalDate(data.dateOfBirth.slice(0, 10))
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "Ngày sinh không hợp lệ")
    }
    data.dateOfBirth = d
  }
  return data
}

export async function createStudent(input: unknown) {
  const data = parseStudentData(input)

  const cls = await db.class.findUnique({ where: { id: data.classId as string } })
  if (!cls) throw new ApiError(400, "Lớp học không tồn tại")

  const student = await db.student.create({ data: data as never })

  if (student.status === MEMBER_STATUS.ACTIVE) {
    await seedAttendanceForClassLessons(student.id, student.classId)
  }

  return student
}

export async function updateStudent(id: string, input: unknown) {
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy học sinh")

  const data = parseStudentData(input, true)

  if (data.classId) {
    const cls = await db.class.findUnique({ where: { id: data.classId as string } })
    if (!cls) throw new ApiError(400, "Lớp học không tồn tại")
  }

  const updated = await db.student.update({ where: { id }, data: data as never })
  const nextClassId = (data.classId as string | undefined) ?? existing.classId
  if (
    nextClassId !== existing.classId &&
    updated.status === MEMBER_STATUS.ACTIVE
  ) {
    await seedAttendanceForClassLessons(updated.id, nextClassId)
  }
  return updated
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
