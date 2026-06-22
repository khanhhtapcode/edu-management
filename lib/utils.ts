import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format ngày dạng dd/MM/yyyy */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Trả về chuỗi "YYYY-MM-DD" theo giờ ĐỊA PHƯƠNG (không dùng toISOString để tránh
 * lệch ngày ở múi giờ dương như UTC+7).
 */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Định dạng "YYYY-MM" -> "Tháng MM/YYYY" */
export function formatMonth(month: string): string {
  const [y, m] = month.split("-")
  return `Tháng ${m}/${y}`
}

/** Tính tuổi từ ngày sinh */
export function calcAge(dob: Date | string): number {
  const d = typeof dob === "string" ? new Date(dob) : dob
  const diff = Date.now() - d.getTime()
  return Math.abs(new Date(diff).getUTCFullYear() - 1970)
}
