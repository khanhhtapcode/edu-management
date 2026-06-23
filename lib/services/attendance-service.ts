import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { attendanceSetSchema } from "@/lib/validations"
import { ATTENDANCE_UNMARKED } from "@/lib/constants"

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

  return db.attendance.upsert({
    where: { lessonId_studentId: { lessonId, studentId } },
    create: { lessonId, studentId, status },
    update: { status },
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
  await db.attendance.deleteMany({ where: { lessonId, studentId } })
  return { lessonId, studentId }
}
