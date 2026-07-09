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

/** Định dạng dung lượng file: B / KB / MB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Parse "YYYY-MM-DD" theo giờ địa phương (tránh lệch ngày với UTC). */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return new Date(Number.NaN)
  return new Date(y, m - 1, d)
}
