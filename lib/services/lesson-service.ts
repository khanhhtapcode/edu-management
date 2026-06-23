import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { lessonSchema } from "@/lib/validations"
import { MEMBER_STATUS, ATTENDANCE_UNMARKED } from "@/lib/constants"

function parseLessonData(input: unknown, partial = false) {
  const schema = partial ? lessonSchema.partial() : lessonSchema
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const data = parsed.data as Record<string, unknown>
  if (typeof data.date === "string") {
    const d = new Date(data.date)
    if (Number.isNaN(d.getTime())) throw new ApiError(400, "Ngày học không hợp lệ")
    data.date = d
  }
  return data
}

/**
 * Tạo buổi học (1 ô thời khóa biểu): lớp + ca + ngày.
 * Tự seed danh sách điểm danh (status rỗng) cho học sinh đang hoạt động của lớp.
 */
export async function createLesson(input: unknown) {
  const data = parseLessonData(input)

  const shift = await db.shift.findUnique({ where: { id: data.shiftId as string } })
  if (!shift) throw new ApiError(400, "Ca học không tồn tại")

  const cls = await db.class.findUnique({ where: { id: data.classId as string } })
  if (!cls) throw new ApiError(400, "Lớp học không tồn tại")

  const lesson = await db.lesson.create({ data: data as never })

  const students = await db.student.findMany({
    where: { classId: cls.id, status: MEMBER_STATUS.ACTIVE },
    select: { id: true },
  })
  if (students.length > 0) {
    await db.attendance.createMany({
      data: students.map((s) => ({
        lessonId: lesson.id,
        studentId: s.id,
        status: ATTENDANCE_UNMARKED,
      })),
    })
  }

  return lesson
}

export async function updateLesson(id: string, input: unknown) {
  const existing = await db.lesson.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy buổi học")

  const data = parseLessonData(input, true)
  if (data.shiftId) {
    const shift = await db.shift.findUnique({ where: { id: data.shiftId as string } })
    if (!shift) throw new ApiError(400, "Ca học không tồn tại")
  }
  if (data.classId) {
    const cls = await db.class.findUnique({ where: { id: data.classId as string } })
    if (!cls) throw new ApiError(400, "Lớp học không tồn tại")
  }
  return db.lesson.update({ where: { id }, data: data as never })
}

export async function deleteLesson(id: string) {
  const existing = await db.lesson.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy buổi học")
  await db.lesson.delete({ where: { id } })
  return { id }
}
