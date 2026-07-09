import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { lessonSchema } from "@/lib/validations"
import { MEMBER_STATUS, ATTENDANCE_UNMARKED } from "@/lib/constants"
import { parseLocalDate } from "@/lib/utils"

function parseLessonData(input: unknown, partial = false) {
  const schema = partial ? lessonSchema.partial() : lessonSchema
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const data = parsed.data as Record<string, unknown>
  if (typeof data.date === "string") {
    const d = parseLocalDate(data.date.slice(0, 10))
    if (Number.isNaN(d.getTime())) throw new ApiError(400, "Ngày học không hợp lệ")
    data.date = d
  }
  return data
}

/** Khoảng [start, end) của một ngày theo giờ địa phương. */
function dayRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

async function assertUniqueLessonSlot(
  classId: string,
  shiftId: string,
  date: Date,
  excludeId?: string
) {
  const { start, end } = dayRange(date)
  const existing = await db.lesson.findFirst({
    where: {
      classId,
      shiftId,
      date: { gte: start, lt: end },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  })
  if (existing) {
    throw new ApiError(
      409,
      "Đã có buổi học cho lớp này ở ca và ngày đã chọn"
    )
  }
}

/** Seed điểm danh rỗng cho mọi HS đang hoạt động của lớp trong 1 buổi. */
export async function seedAttendanceForLesson(lessonId: string, classId: string) {
  const students = await db.student.findMany({
    where: { classId, status: MEMBER_STATUS.ACTIVE },
    select: { id: true },
  })
  if (students.length === 0) return

  await db.attendance.createMany({
    data: students.map((s) => ({
      lessonId,
      studentId: s.id,
      status: ATTENDANCE_UNMARKED,
    })),
    skipDuplicates: true,
  })
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

  const lessonDate = data.date as Date
  await assertUniqueLessonSlot(cls.id, shift.id, lessonDate)

  // Mặc định chuỗi rỗng để tránh vi phạm NOT NULL (an toàn dù DB đã migrate hay chưa)
  data.topic = (data.topic as string | null | undefined) ?? ""
  data.coreKnowledge = (data.coreKnowledge as string | null | undefined) ?? ""

  const lesson = await db.lesson.create({ data: data as never })
  await seedAttendanceForLesson(lesson.id, cls.id)

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

  const nextClassId = (data.classId as string | undefined) ?? existing.classId
  const nextShiftId = (data.shiftId as string | undefined) ?? existing.shiftId
  const nextDate = (data.date as Date | undefined) ?? existing.date

  await assertUniqueLessonSlot(nextClassId, nextShiftId, nextDate, id)

  const updated = await db.lesson.update({ where: { id }, data: data as never })

  if (nextClassId !== existing.classId) {
    await seedAttendanceForLesson(id, nextClassId)
  }

  return updated
}

export async function deleteLesson(id: string) {
  const existing = await db.lesson.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy buổi học")
  await db.lesson.delete({ where: { id } })
  return { id }
}
