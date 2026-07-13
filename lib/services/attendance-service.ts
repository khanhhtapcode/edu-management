import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { attendanceSetSchema } from "@/lib/validations"
import { ATTENDANCE_STATUS, ATTENDANCE_UNMARKED } from "@/lib/constants"

/** Tạo dòng điểm danh rỗng cho học sinh trên mọi buổi học của lớp. */
export async function seedAttendanceForClassLessons(
  studentId: string,
  classId: string
) {
  const lessons = await db.lesson.findMany({
    where: { classId },
    select: { id: true },
  })
  if (lessons.length === 0) return

  await db.attendance.createMany({
    data: lessons.map((l) => ({
      lessonId: l.id,
      studentId,
      status: ATTENDANCE_UNMARKED,
    })),
    skipDuplicates: true,
  })
}

/**
 * Điểm danh 1 học sinh (inline trên thời khóa biểu).
 * status: "" (chưa điểm) | PRESENT | ABSENT.
 */
export async function setAttendance(input: unknown) {
  const parsed = attendanceSetSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { lessonId, studentId, status } = parsed.data

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw new ApiError(404, "Không tìm thấy buổi học")

  const existing = await db.attendance.findUnique({
    where: { lessonId_studentId: { lessonId, studentId } },
  })
  const wasPresent = existing?.status === ATTENDANCE_STATUS.PRESENT
  const isPresent = status === ATTENDANCE_STATUS.PRESENT

  return db.$transaction(async (tx) => {
    const attendance = await tx.attendance.upsert({
      where: { lessonId_studentId: { lessonId, studentId } },
      create: { lessonId, studentId, status },
      update: { status },
    })

    if (wasPresent !== isPresent) {
      const student = await tx.student.findUnique({
        where: { id: studentId },
        select: { sessionCount: true },
      })
      const next = Math.max(
        0,
        (student?.sessionCount ?? 0) + (isPresent ? 1 : -1)
      )
      await tx.student.update({
        where: { id: studentId },
        data: { sessionCount: next },
      })
    }

    return attendance
  })
}

/** Reset bộ đếm số buổi học của học sinh về 0 (vd. sau khi thu học phí đợt mới). */
export async function resetSessionCount(studentId: string) {
  const student = await db.student.findUnique({ where: { id: studentId } })
  if (!student) throw new ApiError(404, "Không tìm thấy học sinh")

  return db.student.update({
    where: { id: studentId },
    data: { sessionCount: 0 },
  })
}

/** Thêm 1 học sinh vào buổi học (tạo dòng điểm danh rỗng). */
export async function addStudentToLesson(lessonId: string, studentId: string) {
  if (!lessonId || !studentId) {
    throw new ApiError(400, "Thiếu thông tin buổi học hoặc học sinh")
  }
  const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw new ApiError(404, "Không tìm thấy buổi học")

  const student = await db.student.findUnique({ where: { id: studentId } })
  if (!student) throw new ApiError(404, "Không tìm thấy học sinh")

  return db.attendance.upsert({
    where: { lessonId_studentId: { lessonId, studentId } },
    create: { lessonId, studentId, status: ATTENDANCE_UNMARKED },
    update: {},
  })
}

/** Bỏ 1 học sinh khỏi buổi học. */
export async function removeStudentFromLesson(
  lessonId: string,
  studentId: string
) {
  if (!lessonId || !studentId) {
    throw new ApiError(400, "Thiếu thông tin buổi học hoặc học sinh")
  }
  await db.$transaction([
    db.studentComment.deleteMany({ where: { lessonId, studentId } }),
    db.attendance.deleteMany({ where: { lessonId, studentId } }),
  ])
  return { lessonId, studentId }
}
