"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Loader2,
  Trash2,
  FileText,
  Download,
  Paperclip,
  CalendarClock,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate, formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

type Klass = { id: string; name: string }
type AssignmentFile = { id: string; fileName: string; size: number }
type Assignment = {
  id: string
  classId: string
  title: string
  description: string | null
  dueDate: string | null
  createdAt: string
  files: AssignmentFile[]
}

export function AssignmentsClient({
  classes,
  assignments,
}: {
  classes: Klass[]
  assignments: Assignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [classId, setClassId] = useState(classes[0]?.id ?? "")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleting, setDeleting] = useState<Assignment | null>(null)

  const classAssignments = useMemo(
    () => assignments.filter((a) => a.classId === classId),
    [assignments, classId]
  )

  function deleteAssignment(id: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/assignments/${id}`, { method: "DELETE" })
        toast.success("Đã xóa bài tập")
        setDeleting(null)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Bài tập về nhà
          </h2>
          <p className="text-sm text-muted-foreground">
            Gửi file bài tập cho từng lớp. Học sinh đăng nhập để tải về.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="w-48">
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
          <Button size="sm" disabled={!classId} onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Tạo bài tập
          </Button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chưa có lớp nào. Tạo lớp trước khi gửi bài tập.
        </div>
      ) : classAssignments.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Lớp này chưa có bài tập nào. Bấm “Tạo bài tập” để gửi bài đầu tiên.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {classAssignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-foreground">
                    {a.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Gửi ngày {formatDate(a.createdAt)}
                    {a.dueDate && (
                      <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                        <CalendarClock className="size-3" /> Hạn {formatDate(a.dueDate)}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleting(a)}
                  disabled={isPending}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                  aria-label="Xóa bài tập"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {a.description && (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.description}
                </p>
              )}

              <div className="space-y-1">
                {a.files.map((f) => (
                  <a
                    key={f.id}
                    href={`/api/assignments/files/${f.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{f.fileName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {formatFileSize(f.size)}
                      <Download className="size-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateAssignmentDialog
          classId={classId}
          className={classes.find((c) => c.id === classId)?.name ?? ""}
          onClose={() => setCreateOpen(false)}
        />
      )}

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài tập</DialogTitle>
            <DialogDescription>
              Bài tập <strong>{deleting?.title}</strong> và các file đính kèm sẽ
              bị xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => deleting && deleteAssignment(deleting.id)}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Xóa bài tập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateAssignmentDialog({
  classId,
  className,
  onClose,
}: {
  classId: string
  className: string
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const files = fileRef.current?.files
    if (!files || files.length === 0) {
      toast.error("Vui lòng đính kèm ít nhất một file")
      return
    }
    startTransition(async () => {
      try {
        const form = new FormData()
        form.set("classId", classId)
        form.set("title", title)
        if (description) form.set("description", description)
        if (dueDate) form.set("dueDate", dueDate)
        Array.from(files).forEach((f) => form.append("files", f))

        await apiFetch("/api/assignments", { method: "POST", body: form })
        toast.success("Đã gửi bài tập cho lớp")
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
          <DialogTitle>Tạo bài tập · {className}</DialogTitle>
          <DialogDescription>
            File đính kèm sẽ được gửi tới toàn bộ học sinh của lớp để tải về.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="atitle">Tiêu đề</Label>
            <Input
              id="atitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài tập Hàm số bậc hai"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adesc">Mô tả (tùy chọn)</Label>
            <Textarea
              id="adesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hướng dẫn làm bài, ghi chú..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adue">Hạn nộp (tùy chọn)</Label>
            <Input
              id="adue"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="afiles">
              <span className="inline-flex items-center gap-1">
                <Paperclip className="size-4" /> File đính kèm
              </span>
            </Label>
            <Input id="afiles" ref={fileRef} type="file" multiple />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !title.trim()}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Gửi bài tập
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
