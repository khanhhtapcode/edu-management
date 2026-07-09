import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { studentSchema } from "@/lib/validations"
import { MEMBER_STATUS } from "@/lib/constants"
import { seedAttendanceForClassLessons } from "@/lib/services/attendance-service"

function parseStudentData(input: unknown, partial = false) {
  const schema = partial ? studentSchema.partial() : studentSchema
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ")
  }
  return parsed.data as Record<string, unknown>
}

/**
 * Chuẩn hóa username/password cho việc ghi DB:
 * - username rỗng -> null (không cấp tài khoản).
 * - password rỗng/không có -> loại khỏi data (giữ mật khẩu cũ khi update).
 * - password có -> hash bcrypt.
 * Kiểm tra trùng username (trừ chính bản ghi đang sửa).
 */
async function normalizeCredentials(
  data: Record<string, unknown>,
  excludeId?: string
) {
  if ("username" in data) {
    const raw = (data.username as string | null | undefined)?.trim()
    if (!raw) {
      data.username = null
    } else {
      const dup = await db.student.findUnique({ where: { username: raw } })
      if (dup && dup.id !== excludeId) {
        throw new ApiError(409, "Tài khoản đăng nhập đã tồn tại")
      }
      data.username = raw
    }
  }

  if ("password" in data) {
    const raw = data.password as string | null | undefined
    if (!raw) {
      delete data.password
    } else {
      data.password = await bcrypt.hash(raw, 10)
    }
  }
}

export async function createStudent(input: unknown) {
  const data = parseStudentData(input)

  const cls = await db.class.findUnique({ where: { id: data.classId as string } })
  if (!cls) throw new ApiError(400, "Lớp học không tồn tại")

  await normalizeCredentials(data)

  const student = await db.student.create({ data: data as never })

  if (student.status === MEMBER_STATUS.ACTIVE) {
    await seedAttendanceForClassLessons(student.id, student.classId)
  }

  return stripPassword(student)
}

/** Loại bỏ hash mật khẩu trước khi trả ra client. */
function stripPassword<T extends { password?: string | null }>(student: T) {
  const rest = { ...student }
  delete rest.password
  return rest
}

export async function updateStudent(id: string, input: unknown) {
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy học sinh")

  const data = parseStudentData(input, true)

  if (data.classId) {
    const cls = await db.class.findUnique({ where: { id: data.classId as string } })
    if (!cls) throw new ApiError(400, "Lớp học không tồn tại")
  }

  await normalizeCredentials(data, id)

  const updated = await db.student.update({ where: { id }, data: data as never })
  const nextClassId = (data.classId as string | undefined) ?? existing.classId
  if (
    nextClassId !== existing.classId &&
    updated.status === MEMBER_STATUS.ACTIVE
  ) {
    await seedAttendanceForClassLessons(updated.id, nextClassId)
  }
  return stripPassword(updated)
}

/** Xóa cứng học sinh (cascade xóa điểm danh, nhận xét, báo cáo liên quan). */
export async function deleteStudent(id: string) {
  const existing = await db.student.findUnique({ where: { id } })
  if (!existing) throw new ApiError(404, "Không tìm thấy học sinh")

  await db.student.delete({ where: { id } })
  return { id }
}
