"use client"

import { useMemo, useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  RotateCcw,
  UserCheck,
  GraduationCap,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
  MEMBER_STATUS,
  STUDENT_STATUS_LABEL,
  GENDER_LABEL,
  SESSION_NOTIFY_THRESHOLD,
} from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StudentForm, type StudentRow } from "./student-form"

type Option = { id: string; name: string }

const ALL = "__all__"
const PAGE_SIZE = 8

export function StudentsClient({
  students,
  classes,
}: {
  students: (StudentRow & { className: string; sessionCount: number })[]
  classes: Option[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [resettingId, setResettingId] = useState<string | null>(null)

  const [rawSearch, setRawSearch] = useState("")
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [page, setPage] = useState(1)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<StudentRow | undefined>()
  const [deleting, setDeleting] = useState<StudentRow | undefined>()

  // Debounce ô tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(t)
  }, [rawSearch])

  // Thông báo 1 lần khi có học sinh đã đến buổi thứ 10 (hoặc bội số)
  const notified = useRef(false)
  useEffect(() => {
    if (notified.current) return
    notified.current = true
    const due = students.filter(
      (s) => s.sessionCount >= SESSION_NOTIFY_THRESHOLD
    )
    for (const s of due) {
      toast.warning(
        `${s.fullName} đã học đủ ${s.sessionCount} buổi — nhắc thu học phí đợt mới`
      )
    }
  }, [students])

  function resetSessionCount(s: StudentRow) {
    setResettingId(s.id)
    startTransition(async () => {
      try {
        await apiFetch(`/api/students/${s.id}/session-count`, {
          method: "POST",
        })
        toast.success(`Đã reset số buổi học của ${s.fullName}`)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      } finally {
        setResettingId(null)
      }
    })
  }

  const statusCounts = useMemo(() => {
    const counts = {
      [ALL]: students.length,
      [MEMBER_STATUS.ACTIVE]: 0,
      [MEMBER_STATUS.RESERVED]: 0,
      [MEMBER_STATUS.INACTIVE]: 0,
    }
    for (const s of students) {
      if (s.status in counts) {
        counts[s.status as keyof typeof counts]++
      }
    }
    return counts
  }, [students])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchQ =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      const matchClass = classFilter === ALL || s.classId === classFilter
      const matchStatus = statusFilter === ALL || s.status === statusFilter
      return matchQ && matchClass && matchStatus
    })
  }, [students, search, classFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  function openAdd() {
    setEditing(undefined)
    setSheetOpen(true)
  }
  function openEdit(s: StudentRow) {
    setEditing(s)
    setSheetOpen(true)
  }

  function confirmDelete() {
    if (!deleting) return
    startTransition(async () => {
      try {
        await apiFetch(`/api/students/${deleting.id}`, { method: "DELETE" })
        toast.success("Đã xóa học sinh")
        setDeleting(undefined)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Segmented Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/60 w-fit">
        {[
          { key: ALL, label: "Tất cả" },
          { key: MEMBER_STATUS.ACTIVE, label: STUDENT_STATUS_LABEL[MEMBER_STATUS.ACTIVE] },
          { key: MEMBER_STATUS.RESERVED, label: STUDENT_STATUS_LABEL[MEMBER_STATUS.RESERVED] },
          { key: MEMBER_STATUS.INACTIVE, label: STUDENT_STATUS_LABEL[MEMBER_STATUS.INACTIVE] },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setStatusFilter(tab.key)
              setPage(1)
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
              statusFilter === tab.key
                ? "bg-card text-foreground shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-extrabold",
                statusFilter === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-background/80 text-muted-foreground"
              )}
            >
              {statusCounts[tab.key as keyof typeof statusCounts] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={rawSearch}
              onChange={(e) => {
                setRawSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm tên học sinh hoặc lớp..."
              className="pl-9.5 rounded-xl border-border/70 bg-card/80 backdrop-blur-md font-medium text-xs focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            value={classFilter}
            onValueChange={(v) => {
              setClassFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px] rounded-xl border-border/70 bg-card/80 text-xs font-semibold">
              <SelectValue placeholder="Tất cả lớp" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value={ALL}>Tất cả lớp</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAdd} className="shrink-0 rounded-xl font-bold gap-2 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer">
          <Plus className="size-4" /> Thêm học sinh
        </Button>
      </div>

      {/* Empty State */}
      {pageRows.length === 0 && (
        <div className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl p-10 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="size-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground/50 border border-border/60">
            <GraduationCap className="size-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-bold text-foreground">Không tìm thấy học sinh nào phù hợp</p>
            <p className="text-xs text-muted-foreground">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc lớp / trạng thái.
            </p>
          </div>
          {(rawSearch || classFilter !== ALL || statusFilter !== ALL) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawSearch("")
                setSearch("")
                setClassFilter(ALL)
                setStatusFilter(ALL)
                setPage(1)
              }}
              className="mt-1 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {pageRows.length > 0 && (
        <div className="hidden md:block rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/40">
              <TableRow className="border-b border-border/60">
                <TableHead className="font-extrabold text-xs uppercase tracking-wider">Họ và tên</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-wider">Lớp học</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="font-extrabold text-xs uppercase tracking-wider">Số buổi học</TableHead>
                <TableHead className="text-right font-extrabold text-xs uppercase tracking-wider">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((s) => (
                <TableRow key={s.id} className="hover:bg-secondary/40 transition-colors">
                  <TableCell>
                    <div>
                      <div className="font-bold text-sm text-foreground">{s.fullName}</div>
                      <div className="text-xs font-semibold text-muted-foreground">
                        {s.gender ? GENDER_LABEL[s.gender] : "—"}
                        {s.schoolName ? ` · ${s.schoolName}` : ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-xs bg-secondary/60 rounded-lg border-border/80">
                      {s.className}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.status === MEMBER_STATUS.ACTIVE ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-lg px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        {STUDENT_STATUS_LABEL[s.status]}
                      </Badge>
                    ) : s.status === MEMBER_STATUS.RESERVED ? (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs rounded-lg px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-amber-500 mr-1.5" />
                        {STUDENT_STATUS_LABEL[s.status]}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-xs rounded-lg px-2.5 py-0.5">
                        {STUDENT_STATUS_LABEL[s.status]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          s.sessionCount >= SESSION_NOTIFY_THRESHOLD
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-extrabold text-xs rounded-lg"
                            : "bg-primary/10 text-primary border-primary/20 font-bold text-xs rounded-lg"
                        }
                      >
                        {s.sessionCount}/{SESSION_NOTIFY_THRESHOLD} buổi
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg hover:bg-secondary cursor-pointer"
                        disabled={isPending && resettingId === s.id}
                        onClick={() => resetSessionCount(s)}
                        aria-label="Reset số buổi học"
                        title="Reset số buổi học về 0"
                      >
                        {isPending && resettingId === s.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5 text-muted-foreground hover:text-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                        aria-label="Sửa"
                        className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(s)}
                        aria-label="Xóa"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile Card Grid View */}
      {pageRows.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {pageRows.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-foreground">{s.fullName}</div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {s.gender ? GENDER_LABEL[s.gender] : "—"}
                    {s.schoolName ? ` · ${s.schoolName}` : ""}
                  </div>
                </div>
                <Badge variant="outline" className="font-bold text-xs bg-secondary/60 rounded-lg border-border/80">
                  {s.className}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  {s.status === MEMBER_STATUS.ACTIVE ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-lg px-2 py-0.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      {STUDENT_STATUS_LABEL[s.status]}
                    </Badge>
                  ) : s.status === MEMBER_STATUS.RESERVED ? (
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs rounded-lg px-2 py-0.5">
                      <span className="size-1.5 rounded-full bg-amber-500 mr-1" />
                      {STUDENT_STATUS_LABEL[s.status]}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-bold text-xs rounded-lg px-2 py-0.5">
                      {STUDENT_STATUS_LABEL[s.status]}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={
                      s.sessionCount >= SESSION_NOTIFY_THRESHOLD
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-extrabold text-xs rounded-lg"
                        : "bg-primary/10 text-primary border-primary/20 font-bold text-xs rounded-lg"
                    }
                  >
                    {s.sessionCount}/{SESSION_NOTIFY_THRESHOLD} buổi
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg hover:bg-secondary cursor-pointer"
                    disabled={isPending && resettingId === s.id}
                    onClick={() => resetSessionCount(s)}
                    aria-label="Reset số buổi học"
                    title="Reset số buổi học về 0"
                  >
                    {isPending && resettingId === s.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(s)}
                    aria-label="Sửa"
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleting(s)}
                    aria-label="Xóa"
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
        <span>
          Hiển thị {filtered.length} học sinh &middot; Trang {current}/{totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold text-xs h-8 cursor-pointer"
            disabled={current <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl font-semibold text-xs h-8 cursor-pointer"
            disabled={current >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md rounded-l-3xl border-l border-border bg-sidebar/95 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle className="text-lg font-extrabold">
              {editing ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
            </SheetTitle>
            <SheetDescription className="text-xs font-semibold">
              {editing
                ? "Cập nhật thông tin học sinh và lưu lại."
                : "Điền thông tin học sinh để lưu vào danh sách lớp."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <StudentForm
              classes={classes}
              initial={editing}
              onDone={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirm Dialog */}
      <Dialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
      >
        <DialogContent className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-destructive">Xác nhận xóa học sinh</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed">
              Học sinh <strong className="text-foreground">{deleting?.fullName}</strong> sẽ bị{" "}
              <strong>xóa vĩnh viễn</strong> khỏi hệ thống. Thao tác không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl font-semibold cursor-pointer" onClick={() => setDeleting(undefined)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold cursor-pointer gap-2"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

