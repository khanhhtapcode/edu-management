import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { commentBulkSchema } from "@/lib/validations"

/** Lưu (upsert) nhận xét cá nhân cho cả buổi học. */
export async function saveComments(input: unknown) {
  const parsed = commentBulkSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { lessonId, records } = parsed.data

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) throw new ApiError(404, "Không tìm thấy buổi học")

  await db.$transaction(
    records.map((r) =>
      db.studentComment.upsert({
        where: { lessonId_studentId: { lessonId, studentId: r.studentId } },
        create: {
          lessonId,
          studentId: r.studentId,
          focusScore: r.focusScore,
          attitude: r.attitude,
          reception: r.reception,
          improvement: r.improvement ?? null,
        },
        update: {
          focusScore: r.focusScore,
          attitude: r.attitude,
          reception: r.reception,
          improvement: r.improvement ?? null,
        },
      })
    )
  )

  return { lessonId, count: records.length }
}
