// Tất cả magic values / status strings tập trung tại đây.

/** Logo trung tâm (file trong `public/`) */
export const APP_LOGO = "/f3b299eb5f38de668729.jpg"

export const MEMBER_STATUS = {
  ACTIVE: "ACTIVE",
  RESERVED: "RESERVED",
  INACTIVE: "INACTIVE",
} as const
export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS]

export const STUDENT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang học",
  RESERVED: "Bảo lưu",
  INACTIVE: "Nghỉ học",
}

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
} as const
export type AttendanceStatus =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS]

/** Chưa điểm danh */
export const ATTENDANCE_UNMARKED = ""

export const ATTENDANCE_STATUS_LABEL: Record<string, string> = {
  PRESENT: "Có mặt",
  ABSENT: "Vắng",
}

export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const

export const GENDER_LABEL: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
}

export const FOCUS_SCALE = [1, 2, 3, 4, 5] as const

// Ca học mẫu (gợi ý seed)
export const DEFAULT_SHIFTS = [
  { name: "Ca 1", startTime: "07:30", endTime: "10:30" },
  { name: "Ca 2", startTime: "14:30", endTime: "16:30" },
  { name: "Ca 3", startTime: "17:00", endTime: "19:00" },
  { name: "Ca 4", startTime: "19:30", endTime: "21:30" },
]
