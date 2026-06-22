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
