"use client"

import { useMemo, useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate } from "@/lib/utils"
import {
  MEMBER_STATUS,
  STUDENT_STATUS_LABEL,
  GENDER_LABEL,
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

function statusVariant(status: string) {
  if (status === MEMBER_STATUS.ACTIVE) return "success" as const
  if (status === MEMBER_STATUS.RESERVED) return "warning" as const
  return "secondary" as const
}

export function StudentsClient({
  students,
  classes,
}: {
  students: (StudentRow & { className: string })[]
  classes: Option[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
        toast.success("Đã chuyển học sinh sang trạng thái nghỉ học")
        setDeleting(undefined)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={rawSearch}
              onChange={(e) => {
                setRawSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo tên hoặc lớp..."
              className="pl-9"
            />
          </div>
          <Select
            value={classFilter}
            onValueChange={(v) => {
              setClassFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
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
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Mọi trạng thái</SelectItem>
              {Object.values(MEMBER_STATUS).map((s) => (
                <SelectItem key={s} value={s}>
                  {STUDENT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" /> Thêm học sinh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Lớp</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày sinh</TableHead>
              <TableHead className="hidden lg:table-cell">SĐT phụ huynh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy học sinh nào.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.gender ? GENDER_LABEL[s.gender] : "—"}
                      {s.schoolName ? ` · ${s.schoolName}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(s.dateOfBirth)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Phone className="size-3" /> {s.parentPhone}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(s.status)}>
                      {STUDENT_STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                        aria-label="Sửa"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(s)}
                        aria-label="Xóa"
                        className="text-destructive hover:text-destructive"
                        disabled={s.status === MEMBER_STATUS.INACTIVE}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filtered.length} học sinh · Trang {current}/{totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editing ? "Chỉnh sửa học sinh" : "Thêm học sinh mới"}
            </SheetTitle>
            <SheetDescription>
              {editing
                ? "Cập nhật thông tin và lưu lại."
                : "Điền thông tin học sinh để thêm vào hệ thống."}
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

      {/* Delete confirm */}
      <Dialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
            <DialogDescription>
              Học sinh <strong>{deleting?.fullName}</strong> sẽ được chuyển sang
              trạng thái <strong>Nghỉ học</strong> (soft delete). Lịch sử điểm
              danh và báo cáo vẫn được giữ lại.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(undefined)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
