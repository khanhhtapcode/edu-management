import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { shiftSchema } from "@/lib/validations"

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export async function createShift(input: unknown) {
  const parsed = shiftSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { startTime, endTime } = parsed.data
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    throw new ApiError(400, "Giờ kết thúc phải sau giờ bắt đầu")
  }
  return db.shift.create({ data: parsed.data })
}

export async function updateShift(id: string, input: unknown) {
  const existing = await db.shift.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy ca học")

  const parsed = shiftSchema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  const { startTime, endTime } = parsed.data
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    throw new ApiError(400, "Giờ kết thúc phải sau giờ bắt đầu")
  }
  return db.shift.update({ where: { id }, data: parsed.data })
}

export async function deleteShift(id: string) {
  const lessonCount = await db.lesson.count({ where: { shiftId: id } })
  if (lessonCount > 0) {
    throw new ApiError(409, "Không thể xóa ca học đã có buổi học")
  }
  await db.shift.delete({ where: { id } })
  return { id }
}
