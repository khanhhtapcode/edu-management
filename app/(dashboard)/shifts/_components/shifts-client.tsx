"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Clock,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Search,
  UserMinus,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { DEFAULT_SHIFTS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Shift = {
  id: string
  name: string
  startTime: string
  endTime: string
  studentCount: number
  lessonCount: number
}
type Student = {
  id: string
  fullName: string
  className: string
  shiftId: string | null
}

export function ShiftsClient({
  shifts,
  students,
}: {
  shifts: Shift[]
  students: Student[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Shift | undefined>()
  const [name, setName] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [deleting, setDeleting] = useState<Shift | undefined>()

  const [selectedShift, setSelectedShift] = useState<string>(
    shifts[0]?.id ?? ""
  )
  const [search, setSearch] = useState("")
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function openAdd() {
    setEditing(undefined)
    setName("")
    setStartTime("")
    setEndTime("")
    setFormOpen(true)
  }
  function openEdit(s: Shift) {
    setEditing(s)
    setName(s.name)
    setStartTime(s.startTime)
    setEndTime(s.endTime)
    setFormOpen(true)
  }

  function saveShift(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const body = { name, startTime, endTime }
        if (editing) {
          await apiFetch(`/api/shifts/${editing.id}`, { method: "PATCH", body })
          toast.success("Đã cập nhật ca học")
        } else {
          await apiFetch("/api/shifts", { method: "POST", body })
          toast.success("Đã thêm ca học")
        }
        setFormOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function seedDefaults() {
    startTransition(async () => {
      try {
        for (const s of DEFAULT_SHIFTS) {
          await apiFetch("/api/shifts", { method: "POST", body: s })
        }
        toast.success("Đã tạo 4 ca học mẫu")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function confirmDelete() {
    if (!deleting) return
    startTransition(async () => {
      try {
        await apiFetch(`/api/shifts/${deleting.id}`, { method: "DELETE" })
        toast.success("Đã xóa ca học")
        setDeleting(undefined)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  // Học sinh chưa thuộc ca đang chọn (để gán thêm)
  const assignable = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter(
      (s) =>
        s.shiftId !== selectedShift &&
        (!q ||
          s.fullName.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q))
    )
  }, [students, selectedShift, search])

  const inShift = useMemo(
    () => students.filter((s) => s.shiftId === selectedShift),
    [students, selectedShift]
  )

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function assign() {
    if (!selectedShift || checked.size === 0) return
    startTransition(async () => {
      try {
        await apiFetch("/api/shifts/assign", {
          method: "POST",
          body: { shiftId: selectedShift, studentIds: Array.from(checked) },
        })
        toast.success(`Đã gán ${checked.size} học sinh vào ca`)
        setChecked(new Set())
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function removeFromShift(studentId: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/shifts/assign?studentId=${studentId}`, {
          method: "DELETE",
        })
        toast.success("Đã bỏ học sinh khỏi ca")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Danh sách ca học */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Các ca học</h3>
        <div className="flex gap-2">
          {shifts.length === 0 && (
            <Button variant="outline" onClick={seedDefaults} disabled={isPending}>
              Tạo 4 ca mẫu
            </Button>
          )}
          <Button onClick={openAdd}>
            <Plus className="size-4" /> Thêm ca
          </Button>
        </div>
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chưa có ca học nào. Tạo nhanh 4 ca mẫu hoặc thêm thủ công.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shifts.map((s) => (
            <Card
              key={s.id}
              onClick={() => setSelectedShift(s.id)}
              className={cn(
                "cursor-pointer transition-colors duration-200 hover:border-primary/50",
                selectedShift === s.id && "border-primary ring-1 ring-primary"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock className="size-4 text-primary" />
                    {s.name}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEdit(s)
                      }}
                      aria-label="Sửa ca"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleting(s)
                      }}
                      aria-label="Xóa ca"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {s.startTime} – {s.endTime}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary">
                    <Users className="size-3" /> {s.studentCount}
                  </Badge>
                  <Badge variant="outline">{s.lessonCount} buổi</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gán học sinh vào ca */}
      {shifts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Học sinh trong ca đã chọn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {inShift.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Chưa có học sinh nào trong ca này.
                </p>
              ) : (
                <div className="max-h-80 space-y-1 overflow-y-auto">
                  {inShift.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {s.fullName}{" "}
                        <span className="text-muted-foreground">
                          · {s.className}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => removeFromShift(s.id)}
                        disabled={isPending}
                        aria-label="Bỏ khỏi ca"
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gán thêm học sinh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm học sinh..."
                  className="pl-9"
                />
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {assignable.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Không có học sinh phù hợp.
                  </p>
                ) : (
                  assignable.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Checkbox
                        checked={checked.has(s.id)}
                        onCheckedChange={() => toggle(s.id)}
                      />
                      <span>
                        {s.fullName}{" "}
                        <span className="text-muted-foreground">
                          · {s.className}
                        </span>
                      </span>
                      {s.shiftId && (
                        <Badge variant="outline" className="ml-auto">
                          đang ở ca khác
                        </Badge>
                      )}
                    </label>
                  ))
                )}
              </div>
              <Button
                onClick={assign}
                disabled={isPending || checked.size === 0}
                className="w-full"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Gán {checked.size > 0 ? `(${checked.size})` : ""} học sinh
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shift form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa ca học" : "Thêm ca học"}</DialogTitle>
            <DialogDescription>
              Định dạng giờ HH:mm (ví dụ 07:30).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveShift} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shiftName">Tên ca</Label>
              <Input
                id="shiftName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ca 1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startTime">Giờ bắt đầu</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Giờ kết thúc</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Thêm ca"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa ca học</DialogTitle>
            <DialogDescription>
              Ca <strong>{deleting?.name}</strong> sẽ bị xóa và các học sinh
              được bỏ gán khỏi ca. Không thể xóa nếu ca đã có buổi học.
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
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
