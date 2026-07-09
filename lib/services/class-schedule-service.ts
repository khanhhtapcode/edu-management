import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { classScheduleSetSchema } from "@/lib/validations"
import { seedAttendanceForLesson } from "@/lib/services/lesson-service"
import { toDateInputValue } from "@/lib/utils"

export async function getClassSchedules(classId: string) {
  return db.classSchedule.findMany({ where: { classId } })
}

/** Ghi đè toàn bộ lịch cố định (thứ + ca) của một lớp. */
export async function setClassSchedule(input: unknown) {
  const parsed = classScheduleSetSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { classId, items } = parsed.data

  const cls = await db.class.findUnique({ where: { id: classId } })
  if (!cls) throw new ApiError(404, "Lớp học không tồn tại")

  await db.$transaction([
    db.classSchedule.deleteMany({ where: { classId } }),
    db.classSchedule.createMany({
      data: items.map((it) => ({ classId, shiftId: it.shiftId, dayOfWeek: it.dayOfWeek })),
      skipDuplicates: true,
    }),
  ])

  return getClassSchedules(classId)
}

/**
 * Tự tạo các buổi học còn thiếu trong tuần [weekStart, weekStart+7) dựa trên
 * lịch cố định của từng lớp. Bỏ qua nếu buổi học đã tồn tại. Gọi trực tiếp từ
 * Server Component khi mở trang lịch (tương tự ensureFundRecordsForYear).
 */
export async function generateLessonsForWeek(weekStart: Date) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [schedules, existingLessons] = await Promise.all([
    db.classSchedule.findMany(),
    db.lesson.findMany({
      where: { date: { gte: weekStart, lt: weekEnd } },
      select: { classId: true, shiftId: true, date: true },
    }),
  ])
  if (schedules.length === 0) return

  const existingKeys = new Set(
    existingLessons.map((l) => `${l.classId}|${l.shiftId}|${toDateInputValue(l.date)}`)
  )

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dayOfWeek = i + 1 // 1=Thứ 2 ... 7=Chủ nhật
    const dateKey = toDateInputValue(date)

    for (const schedule of schedules) {
      if (schedule.dayOfWeek !== dayOfWeek) continue
      const key = `${schedule.classId}|${schedule.shiftId}|${dateKey}`
      if (existingKeys.has(key)) continue

      const lesson = await db.lesson.create({
        data: {
          classId: schedule.classId,
          shiftId: schedule.shiftId,
          date,
          topic: "",
          coreKnowledge: "",
        },
      })
      await seedAttendanceForLesson(lesson.id, schedule.classId)
      existingKeys.add(key)
    }
  }
}
