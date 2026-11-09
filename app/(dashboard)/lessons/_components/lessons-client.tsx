"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Loader2, Trash2, NotebookPen } from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate, toDateInputValue } from "@/lib/utils"
import { FOCUS_SCALE } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

type LessonItem = {
  id: string
  date: string
  topic: string
  classId: string
  className: string
  shiftName: string
}
type Detail = {
  id: string
  date: string
  shiftName: string
  classId: string
  className: string
  topic: string
  coreKnowledge: string
} | null
type RosterRow = {
  studentId: string
  fullName: string
  className: string
  focusScore: number
  attitude: string
  reception: string
  improvement: string
}

export function LessonsClient({
  lessons,
  shifts,
  classes,
  activeClassId,
  detail,
  roster,
}: {
  lessons: LessonItem[]
  shifts: { id: string; name: string }[]
  classes: { id: string; name: string }[]
  activeClassId: string
  detail: Detail
  roster: RosterRow[]
}) {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)
  const [classFilter, setClassFilter] = useState(
    () => detail?.classId ?? activeClassId ?? classes[0]?.id ?? ""
  )

  const classLessons = lessons.filter((l) => l.classId === classFilter)

  function selectClass(id: string) {
    setClassFilter(id)
    const first = lessons.find((l) => l.classId === id)
    // Lớp có buổi -> mở buổi đầu tiên; lớp rỗng -> giữ nguyên lớp qua param classId.
    router.push(first ? `/lessons?lessonId=${first.id}` : `/lessons?classId=${id}`)
  }

  function selectLesson(id: string) {
    router.push(`/lessons?lessonId=${id}`)
  }

  return (
    <div className="space-y-5">
      {/* Selector & Actions Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <div className="w-full sm:w-60 space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Lớp học</Label>
            <Select value={classFilter} onValueChange={selectClass}>
              <SelectTrigger className="rounded-xl border-border/70 bg-card/80 text-xs font-semibold h-10">
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
          </div>
          <div className="w-full sm:w-96 space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Chọn buổi học</Label>
            <Select value={detail?.id ?? ""} onValueChange={selectLesson}>
              <SelectTrigger className="rounded-xl border-border/70 bg-card/80 text-xs font-semibold h-10">
                <SelectValue placeholder="Chọn buổi học" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classLessons.length === 0 ? (
                  <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                    Lớp này chưa có buổi học nào.
                  </div>
                ) : (
                  classLessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {formatDate(l.date)} · {l.shiftName}
                      {l.topic ? ` · ${l.topic}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={() => setNewOpen(true)}
          className="rounded-xl font-bold text-xs h-10 gap-1.5 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer shrink-0"
        >
          <Plus className="size-4" /> Buổi học mới
        </Button>
      </div>

      {!detail ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/90 backdrop-blur-xl p-12 text-center text-sm font-semibold text-muted-foreground shadow-xs">
          Chưa có buổi học nào được chọn. Bấm “Buổi học mới” để tạo bài học và ghi nhật ký.
        </div>
      ) : (
        <LessonDetailEditor
          key={detail.id}
          detail={detail}
          roster={roster}
        />
      )}

      <NewLessonDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        shifts={shifts}
        classes={classes}
      />
    </div>
  )
}

function LessonDetailEditor({
  detail,
  roster,
}: {
  detail: NonNullable<Detail>
  roster: RosterRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)

  const [content, setContent] = useState({
    topic: detail.topic,
    coreKnowledge: detail.coreKnowledge,
  })
  const [comments, setComments] = useState<Record<string, RosterRow>>(() => {
    const map: Record<string, RosterRow> = {}
    for (const r of roster) map[r.studentId] = { ...r }
    return map
  })

  function saveContent() {
    startTransition(async () => {
      try {
        await apiFetch(`/api/lessons/${detail.id}`, {
          method: "PATCH",
          body: content,
        })
        toast.success("Đã lưu nội dung bài học")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function setComment(id: string, field: keyof RosterRow, value: string | number) {
    setComments((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  function saveComments() {
    const records = Object.values(comments).map((c) => ({
      studentId: c.studentId,
      focusScore: c.focusScore,
      attitude: c.attitude,
      reception: c.reception,
      improvement: c.improvement,
    }))
    startTransition(async () => {
      try {
        await apiFetch("/api/comments", {
          method: "POST",
          body: { lessonId: detail.id, records },
        })
        toast.success("Đã lưu nhận xét")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  function deleteLesson() {
    startTransition(async () => {
      try {
        await apiFetch(`/api/lessons/${detail.id}`, { method: "DELETE" })
        toast.success("Đã xóa buổi học")
        setDeleting(false)
        router.push("/lessons")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <>
      {/* Nội dung bài học */}
      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
            <NotebookPen className="size-5 text-primary" />
            <span>{detail.className} &middot; {formatDate(detail.date)} &middot; {detail.shiftName}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-semibold text-xs h-8.5 gap-1.5 cursor-pointer"
            onClick={() => setDeleting(true)}
          >
            <Trash2 className="size-3.5" /> Xóa buổi
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 pt-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Chủ đề bài học</Label>
            <Input
              value={content.topic}
              onChange={(e) =>
                setContent((c) => ({ ...c, topic: e.target.value }))
              }
              placeholder="Nhập chủ đề bài học..."
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">Kiến thức trọng tâm</Label>
            <Input
              value={content.coreKnowledge}
              onChange={(e) =>
                setContent((c) => ({ ...c, coreKnowledge: e.target.value }))
              }
              placeholder="Nhập kiến thức trọng tâm..."
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button
              onClick={saveContent}
              disabled={isPending}
              className="rounded-xl font-bold text-xs h-9.5 gap-2 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu nội dung
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bảng đánh giá cá nhân */}
      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base font-extrabold text-foreground">Đánh giá cá nhân từng học sinh</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {roster.length === 0 ? (
            <p className="py-8 text-center text-xs font-semibold text-muted-foreground">
              Buổi học chưa có học sinh nào.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/70">
                <Table>
                  <TableHeader className="bg-secondary/40">
                    <TableRow className="border-b border-border/60">
                      <TableHead className="min-w-44 font-extrabold text-xs uppercase tracking-wider">Học sinh</TableHead>
                      <TableHead className="w-32 font-extrabold text-xs uppercase tracking-wider">Tập trung</TableHead>
                      <TableHead className="min-w-44 font-extrabold text-xs uppercase tracking-wider">Thái độ</TableHead>
                      <TableHead className="min-w-44 font-extrabold text-xs uppercase tracking-wider">Tiếp thu</TableHead>
                      <TableHead className="min-w-44 font-extrabold text-xs uppercase tracking-wider">Cần cải thiện</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/50">
                    {Object.values(comments).map((c) => (
                      <TableRow key={c.studentId} className="hover:bg-secondary/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-sm text-foreground">{c.fullName}</div>
                          <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                            {c.className}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={String(c.focusScore)}
                            onValueChange={(v) =>
                              setComment(c.studentId, "focusScore", Number(v))
                            }
                          >
                            <SelectTrigger className="h-8.5 rounded-xl border-border/70 bg-background/60 text-xs font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {FOCUS_SCALE.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} / 5
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={c.attitude}
                            onChange={(e) =>
                              setComment(c.studentId, "attitude", e.target.value)
                            }
                            className="min-h-[64px] resize-y rounded-xl border-border/70 bg-background/50 text-xs font-medium"
                            placeholder="Ghi nhận thái độ..."
                            rows={3}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={c.reception}
                            onChange={(e) =>
                              setComment(
                                c.studentId,
                                "reception",
                                e.target.value
                              )
                            }
                            className="min-h-[64px] resize-y rounded-xl border-border/70 bg-background/50 text-xs font-medium"
                            placeholder="Khả năng tiếp thu..."
                            rows={3}
                          />
                        </TableCell>
                        <TableCell>
                          <Textarea
                            value={c.improvement}
                            onChange={(e) =>
                              setComment(
                                c.studentId,
                                "improvement",
                                e.target.value
                              )
                            }
                            className="min-h-[64px] resize-y rounded-xl border-border/70 bg-background/50 text-xs font-medium"
                            placeholder="Điểm cần cải thiện..."
                            rows={3}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={saveComments}
                  disabled={isPending}
                  className="rounded-xl font-bold text-xs h-9.5 gap-2 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Lưu nhận xét
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-destructive">Xác nhận xóa buổi học</DialogTitle>
            <DialogDescription className="text-xs font-medium leading-relaxed">
              Toàn bộ điểm danh và nhận xét của buổi học này sẽ bị xóa vĩnh viễn. Hành
              động không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl font-semibold cursor-pointer" onClick={() => setDeleting(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl font-bold cursor-pointer gap-2"
              onClick={deleteLesson}
              disabled={isPending}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Xóa buổi học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function NewLessonDialog({
  open,
  onOpenChange,
  shifts,
  classes,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  shifts: { id: string; name: string }[]
  classes: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [shiftId, setShiftId] = useState(shifts[0]?.id ?? "")
  const [classId, setClassId] = useState(classes[0]?.id ?? "")
  const [topic, setTopic] = useState("")
  const [coreKnowledge, setCoreKnowledge] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const lesson = await apiFetch<{ id: string }>("/api/lessons", {
          method: "POST",
          body: { date, shiftId, classId, topic, coreKnowledge },
        })
        toast.success("Đã tạo buổi học")
        onOpenChange(false)
        setTopic("")
        setCoreKnowledge("")
        router.push(`/lessons?lessonId=${lesson.id}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Tạo buổi học mới</DialogTitle>
          <DialogDescription className="text-xs font-semibold">
            Nhập thông tin cơ bản, có thể bổ sung chi tiết sau khi tạo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ldate" className="text-xs font-bold text-foreground">Ngày học</Label>
              <Input
                id="ldate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">Ca học</Label>
              <Select value={shiftId} onValueChange={setShiftId}>
                <SelectTrigger className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10">
                  <SelectValue placeholder="Chọn ca" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
            <Label className="text-xs font-bold text-foreground">Lớp</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="ltopic" className="text-xs font-bold text-foreground">Chủ đề bài học</Label>
            <Input
              id="ltopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Phương trình lượng giác"
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lcore" className="text-xs font-bold text-foreground">Kiến thức trọng tâm</Label>
            <Input
              id="lcore"
              value={coreKnowledge}
              onChange={(e) => setCoreKnowledge(e.target.value)}
              placeholder="Ví dụ: Công thức nhân đôi, cộng lượng giác"
              className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10.5 rounded-xl font-bold gap-2 text-xs shadow-md shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
            disabled={isPending || !shiftId || !classId}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Tạo buổi học
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
