"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Loader2,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  File,
  Download,
  Paperclip,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate, formatFileSize } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PageHeading } from "@/components/page-heading"
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
  createdAt: string
  files: AssignmentFile[]
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["pdf"].includes(ext)) {
    return <FileText className="size-4 shrink-0 text-rose-500 transition-transform group-hover:scale-110" />
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className="size-4 shrink-0 text-blue-500 transition-transform group-hover:scale-110" />
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="size-4 shrink-0 text-emerald-500 transition-transform group-hover:scale-110" />
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return <FileArchive className="size-4 shrink-0 text-amber-500 transition-transform group-hover:scale-110" />
  }
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return <FileImage className="size-4 shrink-0 text-purple-500 transition-transform group-hover:scale-110" />
  }
  return <File className="size-4 shrink-0 text-primary transition-transform group-hover:scale-110" />
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
    <div className="space-y-5">
      <PageHeading
        icon={FileText}
        eyebrow="Học tập"
        title="Bài tập về nhà"
        description="Gửi tài liệu, chia sẻ bài tập và lưu trữ học liệu đến từng lớp."
      >
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-52 rounded-xl border-border/70 bg-card/80 text-xs font-bold h-10">
            <SelectValue placeholder="Chọn lớp" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!classId}
          onClick={() => setCreateOpen(true)}
          className="rounded-xl font-bold text-xs h-10 gap-1.5 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
        >
          <Plus className="size-4" /> Tạo bài tập
        </Button>
      </PageHeading>

      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/90 backdrop-blur-xl p-12 text-center text-sm font-semibold text-muted-foreground shadow-xs">
          Chưa có lớp nào trong hệ thống. Vui lòng tạo lớp trước khi gửi bài tập.
        </div>
      ) : classAssignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/90 backdrop-blur-xl p-12 text-center text-sm font-semibold text-muted-foreground shadow-xs">
          Lớp này chưa có bài tập nào. Bấm “Tạo bài tập” để gửi tài liệu bài tập đầu tiên.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {classAssignments.map((a) => (
            <div
              key={a.id}
              className="flex flex-col justify-between gap-3.5 rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl p-5 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-base text-foreground tracking-tight">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Gửi ngày {formatDate(a.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleting(a)}
                    disabled={isPending}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-50"
                    aria-label="Xóa bài tập"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {a.description && (
                  <p className="mt-3 whitespace-pre-wrap text-xs font-medium text-muted-foreground leading-relaxed">
                    {a.description}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/50">
                {a.files.map((f) => (
                  <a
                    key={f.id}
                    href={`/api/assignments/files/${f.id}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs font-semibold transition-all hover:bg-secondary/80 hover:border-primary/30"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      {getFileIcon(f.fileName)}
                      <span className="truncate text-foreground font-bold">{f.fileName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-muted-foreground group-hover:text-primary">
                      {formatFileSize(f.size)}
                      <Download className="size-3.5" />
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
        <DialogContent className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-destructive">Xác nhận xóa bài tập</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed">
              Bài tập <strong className="text-foreground">{deleting?.title}</strong> và các file đính kèm sẽ
              bị xóa vĩnh viễn khỏi hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl font-semibold cursor-pointer" onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold cursor-pointer gap-2"
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
      <DialogContent className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Tạo bài tập &middot; {className}</DialogTitle>
          <DialogDescription className="text-xs font-semibold">
            File đính kèm sẽ được gửi tới toàn bộ học sinh của lớp để tải về.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="atitle" className="text-xs font-bold text-foreground">Tiêu đề bài tập</Label>
            <Input
              id="atitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài tập Hàm số bậc hai và Ứng dụng"
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adesc" className="text-xs font-bold text-foreground">Mô tả / Hướng dẫn (tùy chọn)</Label>
            <Textarea
              id="adesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hướng dẫn làm bài, ghi chú nộp bài..."
              className="rounded-xl border-border/80 bg-background/50 text-xs font-medium"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="afiles" className="text-xs font-bold text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Paperclip className="size-4 text-primary" /> File đính kèm (PDF, DOCX, Hình ảnh...)
              </span>
            </Label>
            <Input
              id="afiles"
              ref={fileRef}
              type="file"
              multiple
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary cursor-pointer"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10.5 rounded-xl font-bold gap-2 text-xs shadow-md shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
            disabled={isPending || !title.trim()}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Gửi bài tập cho lớp
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
