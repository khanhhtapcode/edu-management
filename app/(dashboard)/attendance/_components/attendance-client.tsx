"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2, CalendarDays, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate, cn, toDateInputValue } from "@/lib/utils"
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Lesson = {
  id: string
  date: string
  topic: string
  shiftName: string
  attendanceCount: number
}
type Roster = {
  studentId: string
  fullName: string
  className: string
  status: string
  lateMinutes: number
}
type SelectedLesson = {
  id: string
  date: string
  topic: string
  shiftName: string
  shiftTime: string
} | null

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-success text-white border-success",
  EXCUSED: "bg-info text-white border-info",
  UNEXCUSED: "bg-destructive text-white border-destructive",
  LATE: "bg-warning text-amber-950 border-warning",
}

export function AttendanceClient({
  lessons,
  shifts,
  selectedLesson,
  roster,
}: {
  lessons: Lesson[]
  shifts: { id: string; name: string }[]
  selectedLesson: SelectedLesson
  roster: Roster[]
}) {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)

  function selectLesson(id: string) {
    router.push(`/attendance?lessonId=${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-96 space-y-2">
          <Label>Chọn buổi học</Label>
          <Select value={selectedLesson?.id ?? ""} onValueChange={selectLesson}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn buổi học để điểm danh" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {formatDate(l.date)} · {l.shiftName} · {l.topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={() => setNewOpen(true)}>
          <Plus className="size-4" /> Buổi học mới
        </Button>
      </div>

      {!selectedLesson ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chưa có buổi học nào. Tạo buổi học mới để bắt đầu điểm danh.
        </div>
      ) : (
        <AttendanceRoster
          key={selectedLesson.id}
          roster={roster}
          selectedLesson={selectedLesson}
        />
      )}

      <NewLessonDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        shifts={shifts}
      />
    </div>
  )
}

function buildRecords(roster: Roster[]) {
  const init: Record<string, { status: string; lateMinutes: number }> = {}
  for (const r of roster) {
    init[r.studentId] = { status: r.status, lateMinutes: r.lateMinutes }
  }
  return init
}

function AttendanceRoster({
  roster,
  selectedLesson,
}: {
  roster: Roster[]
  selectedLesson: NonNullable<SelectedLesson>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [records, setRecords] = useState(() => buildRecords(roster))

  function setStatus(studentId: string, status: string) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        status,
        lateMinutes:
          status === ATTENDANCE_STATUS.LATE
            ? prev[studentId]?.lateMinutes || 0
            : 0,
      },
    }))
  }

  function setLate(studentId: string, minutes: number) {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { status: ATTENDANCE_STATUS.LATE, lateMinutes: minutes },
    }))
  }

  function markAllPresent() {
    setRecords((prev) => {
      const next = { ...prev }
      for (const r of roster) {
        next[r.studentId] = { status: ATTENDANCE_STATUS.PRESENT, lateMinutes: 0 }
      }
      return next
    })
  }

  function save() {
    if (!selectedLesson) return
    const payload = roster
      .filter((r) => records[r.studentId]?.status)
      .map((r) => ({
        studentId: r.studentId,
        status: records[r.studentId].status,
        lateMinutes: records[r.studentId].lateMinutes || 0,
      }))
    if (payload.length === 0) {
      toast.error("Chưa có học sinh nào được điểm danh")
      return
    }
    startTransition(async () => {
      try {
        await apiFetch("/api/attendance", {
          method: "POST",
          body: { lessonId: selectedLesson.id, records: payload },
        })
        toast.success("Đã lưu điểm danh")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  const markedCount = roster.filter((r) => records[r.studentId]?.status).length

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="size-6" />
            </div>
            <div>
              <p className="font-semibold">{selectedLesson.topic}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedLesson.date)} · {selectedLesson.shiftName}{" "}
                ({selectedLesson.shiftTime})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {markedCount}/{roster.length} đã điểm danh
            </Badge>
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <CheckCircle2 className="size-4" /> Tất cả có mặt
            </Button>
          </div>
        </div>

        {roster.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ca học này chưa có học sinh nào được gán. Hãy gán học sinh ở mục
            “Ca học”.
          </p>
        ) : (
          <div className="space-y-2">
            {roster.map((r) => {
              const rec = records[r.studentId]
              return (
                <div
                  key={r.studentId}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{r.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.className}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.values(ATTENDANCE_STATUS).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(r.studentId, st)}
                        className={cn(
                          "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                          rec?.status === st
                            ? STATUS_STYLES[st]
                            : "bg-background hover:bg-accent"
                        )}
                      >
                        {ATTENDANCE_STATUS_LABEL[st]}
                      </button>
                    ))}
                    {rec?.status === ATTENDANCE_STATUS.LATE && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          value={rec.lateMinutes || ""}
                          onChange={(e) =>
                            setLate(r.studentId, Number(e.target.value))
                          }
                          className="h-8 w-20"
                          placeholder="phút"
                        />
                        <span className="text-xs text-muted-foreground">
                          phút
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {roster.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button onClick={save} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu điểm danh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function NewLessonDialog({
  open,
  onOpenChange,
  shifts,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  shifts: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? "")
  const [topic, setTopic] = useState("")
  const [coreKnowledge, setCoreKnowledge] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const lesson = await apiFetch<{ id: string }>("/api/lessons", {
          method: "POST",
          body: { date, shiftId, topic, coreKnowledge },
        })
        toast.success("Đã tạo buổi học")
        onOpenChange(false)
        setTopic("")
        setCoreKnowledge("")
        router.push(`/attendance?lessonId=${lesson.id}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo buổi học mới</DialogTitle>
          <DialogDescription>
            Tạo buổi học để điểm danh. Có thể bổ sung nội dung chi tiết ở mục
            Nhật ký bài học.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ndate">Ngày học</Label>
              <Input
                id="ndate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ca học</Label>
              <Select value={shiftId} onValueChange={setShiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ntopic">Chủ đề bài học</Label>
            <Input
              id="ntopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Hàm số bậc hai"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ncore">Kiến thức trọng tâm</Label>
            <Input
              id="ncore"
              value={coreKnowledge}
              onChange={(e) => setCoreKnowledge(e.target.value)}
              placeholder="Tóm tắt kiến thức chính"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !shiftId}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Tạo & điểm danh
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
