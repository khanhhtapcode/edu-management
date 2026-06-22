import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { attendanceBulkSchema } from "@/lib/validations"
import { ATTENDANCE_STATUS } from "@/lib/constants"

/**
 * Lưu (upsert) điểm danh cho cả buổi học một lần.
 */
export async function saveAttendance(input: unknown) {
  const parsed = attendanceBulkSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { lessonId, records } = parsed.data

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw new ApiError(404, "Không tìm thấy buổi học")

  await db.$transaction(
    records.map((r) => {
      const lateMinutes = r.status === ATTENDANCE_STATUS.LATE ? r.lateMinutes : 0
      return db.attendance.upsert({
        where: { lessonId_studentId: { lessonId, studentId: r.studentId } },
        create: {
          lessonId,
          studentId: r.studentId,
          status: r.status,
          lateMinutes,
        },
        update: { status: r.status, lateMinutes },
      })
    })
  )

  return { lessonId, count: records.length }
}
