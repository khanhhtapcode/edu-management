import { z } from "zod"
import { MEMBER_STATUS, ATTENDANCE_STATUS, GENDER } from "@/lib/constants"

export const studentSchema = z.object({
  fullName: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
  gender: z
    .enum([GENDER.MALE, GENDER.FEMALE, GENDER.OTHER])
    .optional()
    .nullable(),
  schoolName: z.string().trim().optional().nullable(),
  status: z.enum([
    MEMBER_STATUS.ACTIVE,
    MEMBER_STATUS.RESERVED,
    MEMBER_STATUS.INACTIVE,
  ]),
  classId: z.string().min(1, "Vui lòng chọn lớp"),
})
export type StudentInput = z.infer<typeof studentSchema>

export const classSchema = z.object({
  name: z.string().trim().min(1, "Tên lớp không được để trống"),
  description: z.string().trim().optional().nullable(),
})

export const shiftSchema = z.object({
  name: z.string().trim().min(1, "Tên ca không được để trống"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ bắt đầu sai định dạng HH:mm"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ kết thúc sai định dạng HH:mm"),
})

export const classScheduleSetSchema = z.object({
  classId: z.string().min(1, "Vui lòng chọn lớp"),
  items: z.array(
    z.object({
      shiftId: z.string().min(1),
      dayOfWeek: z.number().int().min(1).max(7),
    })
  ),
})

export const lessonSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày"),
  shiftId: z.string().min(1, "Vui lòng chọn ca học"),
  classId: z.string().min(1, "Vui lòng chọn lớp"),
  topic: z.string().trim().optional().nullable(),
  coreKnowledge: z.string().trim().optional().nullable(),
  classWork: z.string().trim().optional().nullable(),
  homework: z.string().trim().optional().nullable(),
})

// Điểm danh 1 học sinh (inline trên thời khóa biểu)
export const attendanceSetSchema = z.object({
  lessonId: z.string().min(1),
  studentId: z.string().min(1),
  status: z.enum([
    ATTENDANCE_STATUS.PRESENT,
    ATTENDANCE_STATUS.ABSENT,
    "", // chưa điểm
  ]),
})

export const commentItemSchema = z.object({
  studentId: z.string().min(1),
  focusScore: z.number().int().min(1).max(5),
  attitude: z.string().trim().default(""),
  reception: z.string().trim().default(""),
  improvement: z.string().trim().optional().nullable(),
})

export const commentBulkSchema = z.object({
  lessonId: z.string().min(1),
  records: z.array(commentItemSchema),
})

export const reportSchema = z.object({
  studentId: z.string().min(1, "Vui lòng chọn học sinh"),
  reportMonth: z.string().regex(/^\d{4}-\d{2}$/, "Tháng sai định dạng YYYY-MM"),
  homeworkCompletionRate: z.number().min(0).max(100).default(0),
  homeworkComment: z.string().trim().default(""),
  teacherReview: z.string().trim().default(""),
})
