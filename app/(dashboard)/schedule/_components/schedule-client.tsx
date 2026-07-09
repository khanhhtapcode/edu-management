"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Minus,
  Loader2,
  Trash2,
  Pencil,
  UserPlus,
  Search,
  Clock,
  CalendarClock,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { ATTENDANCE_STATUS, ATTENDANCE_UNMARKED } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Shift = { id: string; name: string; startTime: string; endTime: string }
type Day = { key: string; label: string; dayNum: string; isToday: boolean }
type LessonStudent = { studentId: string; fullName: string; status: string }
type CellLesson = {
  id: string
  shiftId: string
  dateKey: string
  classId: string
  className: string
  topic: string | null
  students: LessonStudent[]
}
type Klass = { id: string; name: string }
type Student = {
  id: string
  fullName: string
  classId: string
  className: string
}
type ClassSchedule = { classId: string; shiftId: string; dayOfWeek: number }

const WEEKDAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

const STATUS_CYCLE = [
  ATTENDANCE_UNMARKED,
  ATTENDANCE_STATUS.PRESENT,
  ATTENDANCE_STATUS.ABSENT,
]

function StatusBadge({
  status,
  onClick,
}: {
  status: string
  onClick: () => void
}) {
  const map: Record<string, { cls: string; icon: typeof Check; title: string }> = {
    "": { cls: "bg-slate-100 text-slate-400 hover:bg-slate-200", icon: Minus, title: "Chưa điểm" },
    PRESENT: { cls: "bg-emerald-500 text-white hover:bg-emerald-600", icon: Check, title: "Có mặt" },
    ABSENT: { cls: "bg-rose-500 text-white hover:bg-rose-600", icon: X, title: "Vắng" },
  }
  const conf = map[status] ?? map[""]
  const Icon = conf.icon
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${conf.title} — bấm để đổi`}
      aria-label={conf.title}
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded transition-colors duration-150 cursor-pointer",
        conf.cls
      )}
    >
      <Icon className="size-3.5" strokeWidth={3} />
    </button>
  )
}

function formatWeekRange(weekStartKey: string) {
  const start = new Date(weekStartKey)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const f = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
  return `Tuần ${f(start)} – ${f(end)} / ${end.getFullYear()}`
}

export function ScheduleClient({
  weekStartKey,
  prevWeekKey,
  nextWeekKey,
  thisWeekKey,
  days,
  shifts,
  lessons,
  classes,
  students,
  classSchedules,
}: {
  weekStartKey: string
  prevWeekKey: string
  nextWeekKey: string
  thisWeekKey: string
  days: Day[]
  shifts: Shift[]
  lessons: CellLesson[]
  classes: Klass[]
  students: Student[]
  classSchedules: ClassSchedule[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  const [createCtx, setCreateCtx] = useState<{ shiftId: string; dateKey: string } | null>(null)
  const [addCtx, setAddCtx] = useState<CellLesson | null>(null)
  const [shiftDialog, setShiftDialog] = useState<
    { mode: "add" } | { mode: "edit"; shift: Shift } | null
  >(null)
  const [deletingShift, setDeletingShift] = useState<Shift | null>(null)
  const [fixedScheduleOpen, setFixedScheduleOpen] = useState(false)

  const cellMap = useMemo(() => {
    const map = new Map<string, CellLesson[]>()
    for (const l of lessons) {
      const key = `${l.shiftId}|${l.dateKey}`
      const arr = map.get(key) ?? []
      arr.push(l)
      map.set(key, arr)
    }
    return map
  }, [lessons])

  function goWeek(key: string) {
    router.push(`/schedule?week=${key}`)
  }

  function cycleStatus(lessonId: string, studentId: string, current: string) {
    const idx = STATUS_CYCLE.indexOf(current)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    const okey = `${lessonId}|${studentId}`
    setOverrides((p) => ({ ...p, [okey]: next }))
    startTransition(async () => {
      try {
        await apiFetch("/api/attendance", {
          method: "POST",
          body: { lessonId, studentId, status: next },
        })
        router.refresh()
      } catch (error) {
        setOverrides((p) => ({ ...p, [okey]: current }))
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function removeStudent(lessonId: string, studentId: string) {
    startTransition(async () => {
      try {
        await apiFetch(
          `/api/attendance/students?lessonId=${lessonId}&studentId=${studentId}`,
          { method: "DELETE" }
        )
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function deleteLesson(lessonId: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/lessons/${lessonId}`, { method: "DELETE" })
        toast.success("Đã xóa buổi học")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function deleteShift(id: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/shifts/${id}`, { method: "DELETE" })
        toast.success("Đã xóa ca học")
        setDeletingShift(null)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Thời khóa biểu</h2>
          <p className="text-sm text-muted-foreground">
            {formatWeekRange(weekStartKey)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => goWeek(prevWeekKey)}>
            <ChevronLeft className="size-4" /> Tuần trước
          </Button>
          <Button
            variant={weekStartKey === thisWeekKey ? "default" : "outline"}
            size="sm"
            onClick={() => goWeek(thisWeekKey)}
          >
            Tuần này
          </Button>
          <Button variant="outline" size="sm" onClick={() => goWeek(nextWeekKey)}>
            Tuần sau <ChevronRight className="size-4" />
          </Button>
          <Button size="sm" onClick={() => setShiftDialog({ mode: "add" })}>
            <Plus className="size-4" /> Thêm ca học
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFixedScheduleOpen(true)}>
            <CalendarClock className="size-4" /> Lịch cố định
          </Button>
        </div>
      </div>

      {/* Grid */}
      {shifts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chưa có ca học nào. Bấm “Thêm ca học” để tạo khung giờ đầu tiên.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="bg-amber-50/60">
                <th className="sticky left-0 z-10 w-28 border-b border-r bg-amber-50/60 p-2 text-xs font-semibold text-slate-500">
                  CA / NGÀY
                </th>
                {days.map((d) => (
                  <th
                    key={d.key}
                    className={cn(
                      "border-b border-r p-2 text-center text-xs font-semibold",
                      d.isToday ? "bg-primary/10 text-primary" : "text-slate-600"
                    )}
                  >
                    <div>{d.label}</div>
                    <div className="text-[11px] font-normal text-slate-400">
                      {d.dayNum}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="group/shift align-top">
                  <td className="sticky left-0 z-10 border-b border-r bg-white p-2">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{shift.name}</div>
                        <div className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          {shift.startTime}–{shift.endTime}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        <button
                          type="button"
                          onClick={() => setShiftDialog({ mode: "edit", shift })}
                          className="rounded p-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-primary group-hover/shift:text-slate-400 cursor-pointer"
                          aria-label="Sửa ca học"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingShift(shift)}
                          disabled={isPending}
                          className="rounded p-0.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500 group-hover/shift:text-slate-400 cursor-pointer disabled:opacity-50"
                          aria-label="Xóa ca học"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  {days.map((d) => {
                    const cell = cellMap.get(`${shift.id}|${d.key}`) ?? []
                    return (
                      <td
                        key={d.key}
                        className={cn(
                          "border-b border-r p-1.5 align-top",
                          d.isToday && "bg-primary/[0.03]"
                        )}
                      >
                        <div className="flex min-h-[88px] flex-col gap-1.5">
                          {cell.map((lesson) => (
                            <LessonCard
                              key={lesson.id}
                              lesson={lesson}
                              overrides={overrides}
                              onCycle={cycleStatus}
                              onAddStudent={() => setAddCtx(lesson)}
                              onRemoveStudent={removeStudent}
                              onDelete={() => deleteLesson(lesson.id)}
                              disabled={isPending}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              setCreateCtx({ shiftId: shift.id, dateKey: d.key })
                            }
                            className="flex h-8 items-center justify-center rounded-md border border-dashed border-slate-200 text-slate-300 transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
                            aria-label="Thêm buổi học"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-slate-600">Trạng thái điểm danh:</span>
        <span className="inline-flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded bg-emerald-500 text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
          Có mặt
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded bg-rose-500 text-white">
            <X className="size-3" strokeWidth={3} />
          </span>
          Vắng
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="flex size-4 items-center justify-center rounded bg-slate-100 text-slate-400">
            <Minus className="size-3" strokeWidth={3} />
          </span>
          Chưa điểm
        </span>
        <span className="text-slate-400">— Bấm trạng thái để thay đổi</span>
      </div>

      {createCtx && (
        <CreateLessonDialog
          ctx={createCtx}
          classes={classes}
          onClose={() => setCreateCtx(null)}
        />
      )}
      {addCtx && (
        <AddStudentDialog
          lesson={addCtx}
          students={students}
          onClose={() => setAddCtx(null)}
        />
      )}
      {fixedScheduleOpen && (
        <FixedScheduleDialog
          classes={classes}
          shifts={shifts}
          classSchedules={classSchedules}
          onClose={() => setFixedScheduleOpen(false)}
        />
      )}
      {shiftDialog && (
        <ShiftFormDialog
          key={shiftDialog.mode === "edit" ? shiftDialog.shift.id : "add"}
          mode={shiftDialog.mode}
          shift={shiftDialog.mode === "edit" ? shiftDialog.shift : undefined}
          onClose={() => setShiftDialog(null)}
        />
      )}

      <Dialog
        open={!!deletingShift}
        onOpenChange={(o) => !o && setDeletingShift(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa ca học</DialogTitle>
            <DialogDescription>
              Ca <strong>{deletingShift?.name}</strong> (
              {deletingShift?.startTime}–{deletingShift?.endTime}) sẽ bị xóa
              vĩnh viễn. Chỉ xóa được khi ca chưa có buổi học nào.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingShift(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingShift && deleteShift(deletingShift.id)}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Xóa ca học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LessonCard({
  lesson,
  overrides,
  onCycle,
  onAddStudent,
  onRemoveStudent,
  onDelete,
  disabled,
}: {
  lesson: CellLesson
  overrides: Record<string, string>
  onCycle: (lessonId: string, studentId: string, current: string) => void
  onAddStudent: () => void
  onRemoveStudent: (lessonId: string, studentId: string) => void
  onDelete: () => void
  disabled: boolean
}) {
  return (
    <div className="group rounded-md border border-slate-200 bg-white p-1.5 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-1">
        <span className="truncate text-xs font-semibold text-primary">
          {lesson.className}
        </span>
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="hidden shrink-0 text-slate-300 hover:text-rose-500 group-hover:block cursor-pointer"
          aria-label="Xóa buổi học"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {lesson.students.map((s) => {
          const status = overrides[`${lesson.id}|${s.studentId}`] ?? s.status
          return (
            <div
              key={s.studentId}
              className="flex items-center justify-between gap-1"
            >
              <span className="group/stu flex min-w-0 items-center gap-1">
                <span className="truncate text-[11px] text-slate-600">
                  {s.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveStudent(lesson.id, s.studentId)}
                  className="hidden text-slate-300 hover:text-rose-500 group-hover/stu:inline cursor-pointer"
                  aria-label="Bỏ học sinh"
                >
                  <X className="size-3" />
                </button>
              </span>
              <StatusBadge
                status={status}
                onClick={() => onCycle(lesson.id, s.studentId, status)}
              />
            </div>
          )
        })}
        <button
          type="button"
          onClick={onAddStudent}
          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-primary cursor-pointer"
        >
          <UserPlus className="size-3" /> Thêm HS
        </button>
      </div>
    </div>
  )
}

function CreateLessonDialog({
  ctx,
  classes,
  onClose,
}: {
  ctx: { shiftId: string; dateKey: string }
  classes: Klass[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [classId, setClassId] = useState(classes[0]?.id ?? "")
  const [topic, setTopic] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await apiFetch("/api/lessons", {
          method: "POST",
          body: {
            date: ctx.dateKey,
            shiftId: ctx.shiftId,
            classId,
            topic: topic || null,
          },
        })
        toast.success("Đã thêm buổi học")
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm buổi học</DialogTitle>
          <DialogDescription>
            Chọn lớp cho ô này. Danh sách học sinh của lớp sẽ tự được thêm để
            điểm danh.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Lớp</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctopic">Chủ đề (tùy chọn)</Label>
            <Input
              id="ctopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Hàm số bậc hai"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !classId}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Thêm buổi học
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddStudentDialog({
  lesson,
  students,
  onClose,
}: {
  lesson: CellLesson
  students: Student[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState("")

  const existing = new Set(lesson.students.map((s) => s.studentId))
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students
      .filter((s) => !existing.has(s.id))
      .filter(
        (s) =>
          !q ||
          s.fullName.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // ưu tiên cùng lớp với buổi học
        const aSame = a.classId === lesson.classId ? 0 : 1
        const bSame = b.classId === lesson.classId ? 0 : 1
        return aSame - bSame
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, search, lesson])

  function add(studentId: string) {
    startTransition(async () => {
      try {
        await apiFetch("/api/attendance/students", {
          method: "POST",
          body: { lessonId: lesson.id, studentId },
        })
        toast.success("Đã thêm học sinh")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm học sinh vào buổi · {lesson.className}</DialogTitle>
          <DialogDescription>
            Bấm vào học sinh để thêm vào danh sách điểm danh của buổi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh..."
              className="pl-9"
            />
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Không còn học sinh phù hợp.
              </p>
            ) : (
              candidates.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => add(s.id)}
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-accent cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {s.fullName}{" "}
                    <span className="text-muted-foreground">· {s.className}</span>
                  </span>
                  <UserPlus className="size-4 text-primary" />
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FixedScheduleDialog({
  classes,
  shifts,
  classSchedules,
  onClose,
}: {
  classes: Klass[]
  shifts: Shift[]
  classSchedules: ClassSchedule[]
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [classId, setClassId] = useState(classes[0]?.id ?? "")
  const [checked, setChecked] = useState<Set<string>>(() => {
    const initial = classSchedules.filter((cs) => cs.classId === classes[0]?.id)
    return new Set(initial.map((cs) => `${cs.shiftId}|${cs.dayOfWeek}`))
  })

  function selectClass(id: string) {
    setClassId(id)
    const initial = classSchedules.filter((cs) => cs.classId === id)
    setChecked(new Set(initial.map((cs) => `${cs.shiftId}|${cs.dayOfWeek}`)))
  }

  function toggle(shiftId: string, dayOfWeek: number) {
    const key = `${shiftId}|${dayOfWeek}`
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function submit() {
    startTransition(async () => {
      try {
        const items = Array.from(checked).map((key) => {
          const [shiftId, dayOfWeek] = key.split("|")
          return { shiftId, dayOfWeek: Number(dayOfWeek) }
        })
        await apiFetch("/api/class-schedules", {
          method: "POST",
          body: { classId, items },
        })
        toast.success("Đã lưu lịch cố định")
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-primary" />
            Lịch cố định hàng tuần
          </DialogTitle>
          <DialogDescription>
            Tick vào các ô (thứ + ca) mà lớp học lặp lại mỗi tuần. Hệ thống sẽ
            tự tạo buổi học cho các tuần sau, không cần thêm tay.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lớp</Label>
            <Select value={classId} onValueChange={selectClass}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có ca học nào để thiết lập lịch cố định.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border-b border-r p-2 text-left text-xs font-semibold text-slate-500">
                      CA HỌC
                    </th>
                    {WEEKDAY_LABELS.map((label) => (
                      <th
                        key={label}
                        className="border-b p-2 text-center text-xs font-semibold text-slate-500"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="border-r border-b p-2 text-xs font-medium">
                        {shift.name}
                        <div className="text-[11px] text-slate-400">
                          {shift.startTime}–{shift.endTime}
                        </div>
                      </td>
                      {WEEKDAY_LABELS.map((_, idx) => {
                        const dayOfWeek = idx + 1
                        const key = `${shift.id}|${dayOfWeek}`
                        return (
                          <td key={key} className="border-b p-2 text-center">
                            <Checkbox
                              checked={checked.has(key)}
                              onCheckedChange={() => toggle(shift.id, dayOfWeek)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={isPending || !classId}
            onClick={submit}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Lưu lịch cố định
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShiftFormDialog({
  mode,
  shift,
  onClose,
}: {
  mode: "add" | "edit"
  shift?: Shift
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(shift?.name ?? "")
  const [startTime, setStartTime] = useState(shift?.startTime ?? "")
  const [endTime, setEndTime] = useState(shift?.endTime ?? "")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        if (mode === "edit" && shift) {
          await apiFetch(`/api/shifts/${shift.id}`, {
            method: "PATCH",
            body: { name, startTime, endTime },
          })
          toast.success("Đã cập nhật ca học")
        } else {
          await apiFetch("/api/shifts", {
            method: "POST",
            body: { name, startTime, endTime },
          })
          toast.success("Đã thêm ca học")
        }
        onClose()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            {mode === "edit" ? "Sửa ca học" : "Thêm ca học"}
          </DialogTitle>
          <DialogDescription>Định dạng giờ HH:mm (vd 07:30).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sname">Tên ca</Label>
            <Input
              id="sname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ca 1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sstart">Giờ bắt đầu</Label>
              <Input
                id="sstart"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send">Giờ kết thúc</Label>
              <Input
                id="send"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {mode === "edit" ? "Lưu thay đổi" : "Thêm ca học"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
