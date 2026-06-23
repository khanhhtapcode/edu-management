import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { reportSchema } from "@/lib/validations"
import { ATTENDANCE_STATUS } from "@/lib/constants"

function monthRange(reportMonth: string) {
  const [y, m] = reportMonth.split("-").map(Number)
  if (!y || !m || m < 1 || m > 12) {
    throw new ApiError(400, "Tháng báo cáo không hợp lệ")
  }
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1)
  return { start, end }
}

/** Tính toán thống kê trực tiếp từ dữ liệu (dùng cho preview & snapshot). */
export async function computeMonthlyStats(
  studentId: string,
  reportMonth: string
) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  })
  if (!student) throw new ApiError(404, "Không tìm thấy học sinh")

  const { start, end } = monthRange(reportMonth)

  const lessons = await db.lesson.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  })
  const lessonIds = lessons.map((l) => l.id)

  const attendances = await db.attendance.findMany({
    where: { studentId, lessonId: { in: lessonIds } },
  })
  const comments = await db.studentComment.findMany({
    where: { studentId, lessonId: { in: lessonIds } },
  })

  const presentCount = attendances.filter(
    (a) => a.status === ATTENDANCE_STATUS.PRESENT
  ).length
  const absentCount = attendances.filter(
    (a) => a.status === ATTENDANCE_STATUS.ABSENT
  ).length
  const totalLessons = presentCount + absentCount
  const attendanceRate =
    totalLessons > 0 ? Math.round((presentCount / totalLessons) * 1000) / 10 : 0

  const avgFocus =
    comments.length > 0
      ? Math.round(
          (comments.reduce((s, c) => s + c.focusScore, 0) / comments.length) *
            10
        ) / 10
      : 0

  // Buổi học của lớp HS (để liệt kê nội dung đã học)
  const classLessons = lessons.filter((l) => l.classId === student.classId)

  return {
    student,
    reportMonth,
    totalLessons,
    presentCount,
    absentCount,
    attendanceRate,
    avgFocus,
    lessons: classLessons,
    comments,
  }
}

/** Tạo hoặc cập nhật phiếu báo cáo tháng (snapshot). */
export async function createOrUpdateReport(input: unknown) {
  const parsed = reportSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const {
    studentId,
    reportMonth,
    homeworkCompletionRate,
    homeworkComment,
    teacherReview,
  } = parsed.data

  const stats = await computeMonthlyStats(studentId, reportMonth)

  return db.monthlyReport.upsert({
    where: { studentId_reportMonth: { studentId, reportMonth } },
    create: {
      studentId,
      reportMonth,
      totalLessons: stats.totalLessons,
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      attendanceRate: stats.attendanceRate,
      homeworkCompletionRate,
      homeworkComment,
      teacherReview,
    },
    update: {
      totalLessons: stats.totalLessons,
      presentCount: stats.presentCount,
      absentCount: stats.absentCount,
      attendanceRate: stats.attendanceRate,
      homeworkCompletionRate,
      homeworkComment,
      teacherReview,
    },
  })
}

export async function deleteReport(id: string) {
  const existing = await db.monthlyReport.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy báo cáo")
  await db.monthlyReport.delete({ where: { id } })
  return { id }
}
