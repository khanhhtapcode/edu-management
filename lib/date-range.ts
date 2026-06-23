import { parseLocalDate } from "@/lib/utils"

export type RangePreset = "today" | "week" | "month" | "custom"

/** Trả về [start, end) cho preset/khoảng tùy chọn. */
export function resolveRange(
  preset: string | undefined,
  from?: string,
  to?: string
): { start: Date; end: Date; preset: RangePreset } {
  const now = new Date()
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (preset === "custom" && from) {
    const fromDate = parseLocalDate(from)
    const toDate = to ? parseLocalDate(to) : fromDate
    // Bỏ qua khoảng tùy chọn nếu ngày không hợp lệ -> rơi về mặc định (today)
    if (!Number.isNaN(fromDate.getTime()) && !Number.isNaN(toDate.getTime())) {
      const start = startOfDay(fromDate)
      const end = new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate() + 1
      )
      return { start, end, preset: "custom" }
    }
  }

  if (preset === "week") {
    const day = now.getDay() === 0 ? 7 : now.getDay() // Mon=1..Sun=7
    const start = startOfDay(new Date(now))
    start.setDate(start.getDate() - (day - 1))
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end, preset: "week" }
  }

  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return { start, end, preset: "month" }
  }

  // default: today
  const start = startOfDay(now)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end, preset: "today" }
}

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Hôm nay",
  week: "Tuần này",
  month: "Tháng này",
  custom: "Tùy chọn",
}
