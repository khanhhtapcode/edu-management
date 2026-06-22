"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/lib/utils"

type Option = { id: string; name: string }

const ALL = "__all__"

export function DashboardFilters({
  classes,
  shifts,
}: {
  classes: Option[]
  shifts: Option[]
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const preset = params.get("range") ?? "today"
  const classId = params.get("classId") ?? ALL
  const shiftId = params.get("shiftId") ?? ALL
  const from = params.get("from") ?? undefined
  const to = params.get("to") ?? undefined

  function update(next: Record<string, string | undefined>) {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === ALL) sp.delete(k)
      else sp.set(k, v)
    }
    router.push(`/?${sp.toString()}`)
  }

  const selected: DateRange | undefined = from
    ? { from: new Date(from), to: to ? new Date(to) : undefined }
    : undefined

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={(v) => update({ range: v, from: undefined, to: undefined })}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hôm nay</SelectItem>
          <SelectItem value="week">Tuần này</SelectItem>
          <SelectItem value="month">Tháng này</SelectItem>
          <SelectItem value="custom">Tùy chọn</SelectItem>
        </SelectContent>
      </Select>

      {preset === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start gap-2 font-normal">
              <CalendarIcon className="size-4" />
              {selected?.from ? (
                selected.to ? (
                  <>
                    {formatDate(selected.from)} → {formatDate(selected.to)}
                  </>
                ) : (
                  formatDate(selected.from)
                )
              ) : (
                "Chọn khoảng ngày"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={selected}
              onSelect={(range) => {
                update({
                  range: "custom",
                  from: range?.from
                    ? range.from.toISOString().slice(0, 10)
                    : undefined,
                  to: range?.to ? range.to.toISOString().slice(0, 10) : undefined,
                })
              }}
            />
          </PopoverContent>
        </Popover>
      )}

      <Select value={classId} onValueChange={(v) => update({ classId: v })}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tất cả lớp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả lớp</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={shiftId} onValueChange={(v) => update({ shiftId: v })}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tất cả ca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Tất cả ca</SelectItem>
          {shifts.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
