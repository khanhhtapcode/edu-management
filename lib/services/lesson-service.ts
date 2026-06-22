import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { lessonSchema } from "@/lib/validations"

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

export async function createLesson(input: unknown) {
  const data = parseLessonData(input)

  const shift = await db.shift.findUnique({ where: { id: data.shiftId as string } })
  if (!shift) throw new ApiError(400, "Ca học không tồn tại")

  return db.lesson.create({ data: data as never })
}

export async function updateLesson(id: string, input: unknown) {
  const existing = await db.lesson.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy buổi học")

  const data = parseLessonData(input, true)
  if (data.shiftId) {
    const shift = await db.shift.findUnique({ where: { id: data.shiftId as string } })
    if (!shift) throw new ApiError(400, "Ca học không tồn tại")
  }
  return db.lesson.update({ where: { id }, data: data as never })
}

export async function deleteLesson(id: string) {
  const existing = await db.lesson.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy buổi học")
  await db.lesson.delete({ where: { id } })
  return { id }
}
