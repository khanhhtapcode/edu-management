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
  shiftName: string
}
type Detail = {
  id: string
  date: string
  shiftId: string
  shiftName: string
  topic: string
  coreKnowledge: string
  classWork: string
  homework: string
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
  detail,
  roster,
}: {
  lessons: LessonItem[]
  shifts: { id: string; name: string }[]
  detail: Detail
  roster: RosterRow[]
}) {
  const router = useRouter()
  const [newOpen, setNewOpen] = useState(false)

  function selectLesson(id: string) {
    router.push(`/lessons?lessonId=${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:w-96 space-y-2">
          <Label>Chọn buổi học</Label>
          <Select value={detail?.id ?? ""} onValueChange={selectLesson}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn buổi học" />
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

      {!detail ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chưa có buổi học. Tạo buổi học mới để ghi nhật ký.
        </div>
      ) : (
        <LessonDetailEditor
          key={detail.id}
          detail={detail}
          roster={roster}
        />
      )}

      <NewLessonDialog open={newOpen} onOpenChange={setNewOpen} shifts={shifts} />
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
    classWork: detail.classWork,
    homework: detail.homework,
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
      <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <NotebookPen className="size-5 text-primary" />
                Nội dung bài học · {formatDate(detail.date)} · {detail.shiftName}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleting(true)}
              >
                <Trash2 className="size-4" /> Xóa buổi
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Chủ đề bài học</Label>
                <Input
                  value={content.topic}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, topic: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Kiến thức trọng tâm</Label>
                <Input
                  value={content.coreKnowledge}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, coreKnowledge: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Bài tập luyện tại lớp</Label>
                <Textarea
                  value={content.classWork}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, classWork: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Bài tập về nhà</Label>
                <Textarea
                  value={content.homework}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, homework: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={saveContent} disabled={isPending}>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đánh giá cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              {roster.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Ca học chưa có học sinh được gán.
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-40">Học sinh</TableHead>
                        <TableHead className="w-28">Tập trung</TableHead>
                        <TableHead className="min-w-44">Thái độ</TableHead>
                        <TableHead className="min-w-44">Tiếp thu</TableHead>
                        <TableHead className="min-w-44">Cần cải thiện</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(comments).map((c) => (
                        <TableRow key={c.studentId}>
                          <TableCell>
                            <div className="font-medium">{c.fullName}</div>
                            <div className="text-xs text-muted-foreground">
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
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FOCUS_SCALE.map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} / 5
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={c.attitude}
                              onChange={(e) =>
                                setComment(c.studentId, "attitude", e.target.value)
                              }
                              className="h-8"
                              placeholder="..."
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={c.reception}
                              onChange={(e) =>
                                setComment(
                                  c.studentId,
                                  "reception",
                                  e.target.value
                                )
                              }
                              className="h-8"
                              placeholder="..."
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={c.improvement}
                              onChange={(e) =>
                                setComment(
                                  c.studentId,
                                  "improvement",
                                  e.target.value
                                )
                              }
                              className="h-8"
                              placeholder="..."
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={saveComments} disabled={isPending}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa buổi học</DialogTitle>
            <DialogDescription>
              Toàn bộ điểm danh và nhận xét của buổi học này sẽ bị xóa. Hành
              động không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
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
        router.push(`/lessons?lessonId=${lesson.id}`)
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
            Nhập thông tin cơ bản, có thể bổ sung chi tiết sau khi tạo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ldate">Ngày học</Label>
              <Input
                id="ldate"
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
            <Label htmlFor="ltopic">Chủ đề bài học</Label>
            <Input
              id="ltopic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lcore">Kiến thức trọng tâm</Label>
            <Input
              id="lcore"
              value={coreKnowledge}
              onChange={(e) => setCoreKnowledge(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !shiftId}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Tạo buổi học
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
