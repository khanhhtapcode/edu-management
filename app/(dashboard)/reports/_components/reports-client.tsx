"use client"

import { Fragment, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  FileDown,
  FileSpreadsheet,
  Save,
  Loader2,
  Trash2,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Check,
  X as XIcon,
  Minus,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatDate, formatMonth } from "@/lib/utils"
import { ATTENDANCE_STATUS_LABEL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AttendancePie } from "@/components/charts/attendance-pie"
import { EvaluationRadar } from "@/components/charts/radar-chart"
import { BrandLogo } from "@/components/brand-logo"

export type ReportStats = {
  studentId: string
  studentName: string
  className: string
  reportMonth: string
  totalLessons: number
  presentCount: number
  absentCount: number
  attendanceRate: number
  avgFocus: number
  topics: { date: string; topic: string; coreKnowledge: string; homework: string }[]
  sessions: {
    date: string
    topic: string
    coreKnowledge: string
    status: string
  }[]
  existing: {
    homeworkCompletionRate: number
    homeworkComment: string
    teacherReview: string
  } | null
}

type Student = { id: string; name: string; className: string }
type HistoryItem = {
  id: string
  studentName: string
  className: string
  reportMonth: string
  attendanceRate: number
  createdAt: string
  lessons: {
    date: string
    topic: string
    coreKnowledge: string
    status: string
  }[]
}

function monthOptions() {
  const out: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    out.push({ value: v, label: formatMonth(v) })
  }
  return out
}

export function ReportsClient({
  students,
  month,
  selectedStudentId,
  stats,
  history,
}: {
  students: Student[]
  month: string
  selectedStudentId: string
  stats: ReportStats | null
  history: HistoryItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  function toggleExpand(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }))
  }

  function navigate(next: { studentId?: string; month?: string }) {
    const sid = next.studentId ?? selectedStudentId
    const m = next.month ?? month
    const sp = new URLSearchParams()
    if (sid) sp.set("studentId", sid)
    sp.set("month", m)
    router.push(`/reports?${sp.toString()}`)
  }

  function deleteReport(id: string) {
    startTransition(async () => {
      try {
        await apiFetch(`/api/reports/${id}`, { method: "DELETE" })
        toast.success("Đã xóa báo cáo")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardContent className="flex flex-col gap-3.5 p-5 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Học sinh</Label>
            <Select
              value={selectedStudentId}
              onValueChange={(v) => navigate({ studentId: v })}
            >
              <SelectTrigger className="rounded-xl border-border/70 bg-background/50 text-xs font-semibold h-10">
                <SelectValue placeholder="Chọn học sinh để xem báo cáo" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} &middot; {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-1.5 sm:w-60">
            <Label className="text-xs font-bold text-foreground">Tháng tổng kết</Label>
            <Select value={month} onValueChange={(v) => navigate({ month: v })}>
              <SelectTrigger className="rounded-xl border-border/70 bg-background/50 text-xs font-semibold h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {monthOptions().map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!stats ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/90 backdrop-blur-xl p-12 text-center text-sm font-semibold text-muted-foreground shadow-xs">
          Chọn học sinh từ danh sách bên trên để xem thống kê chuyên cần và tạo phiếu báo cáo tháng.
        </div>
      ) : (
        <ReportStatsPanel
          key={`${stats.studentId}-${stats.reportMonth}`}
          stats={stats}
        />
      )}

      {/* Lịch sử báo cáo */}
      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
            <CalendarRange className="size-5 text-primary" />
            <span>Nhật ký báo cáo đã lưu</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {history.length === 0 ? (
            <p className="py-8 text-center text-xs font-semibold text-muted-foreground">
              Chưa có báo cáo nào được lưu trong hệ thống.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="border-b border-border/60">
                    <TableHead className="w-10" />
                    <TableHead className="font-extrabold text-xs uppercase tracking-wider">Học sinh</TableHead>
                    <TableHead className="font-extrabold text-xs uppercase tracking-wider">Lớp</TableHead>
                    <TableHead className="font-extrabold text-xs uppercase tracking-wider">Tháng</TableHead>
                    <TableHead className="font-extrabold text-xs uppercase tracking-wider">Chuyên cần</TableHead>
                    <TableHead className="font-extrabold text-xs uppercase tracking-wider">Ngày tạo</TableHead>
                    <TableHead className="text-right font-extrabold text-xs uppercase tracking-wider">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/50">
                  {history.map((h) => {
                    const isOpen = !!expanded[h.id]
                    return (
                      <Fragment key={h.id}>
                        <TableRow
                          onClick={() => toggleExpand(h.id)}
                          className="cursor-pointer hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="text-muted-foreground">
                            {isOpen ? (
                              <ChevronDown className="size-4 text-primary" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {h.studentName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold text-xs bg-secondary/60 rounded-lg">
                              {h.className}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-muted-foreground">{formatMonth(h.reportMonth)}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-lg px-2.5 py-0.5">
                              {h.attendanceRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-muted-foreground">
                            {h.createdAt}
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                              onClick={() => deleteReport(h.id)}
                              disabled={isPending}
                              aria-label="Xóa báo cáo"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={7} className="p-0">
                              <LessonHistoryTable lessons={h.lessons} />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReportStatsPanel({ stats }: { stats: ReportStats }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [generating, setGenerating] = useState(false)

  const [homeworkRate, setHomeworkRate] = useState(
    stats.existing?.homeworkCompletionRate ?? 0
  )
  const [homeworkComment, setHomeworkComment] = useState(
    stats.existing?.homeworkComment ?? ""
  )
  const [teacherReview, setTeacherReview] = useState(
    stats.existing?.teacherReview ?? ""
  )

  function saveReport() {
    startTransition(async () => {
      try {
        await apiFetch("/api/reports", {
          method: "POST",
          body: {
            studentId: stats.studentId,
            reportMonth: stats.reportMonth,
            homeworkCompletionRate: homeworkRate,
            homeworkComment,
            teacherReview,
          },
        })
        toast.success("Đã lưu báo cáo tháng")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  async function exportPdf() {
    setGenerating(true)
    try {
      const { generateReportPdf } = await import("@/lib/report-pdf")
      const blob = await generateReportPdf(
        {
          studentName: stats.studentName,
          className: stats.className,
          reportMonth: stats.reportMonth,
          totalLessons: stats.totalLessons,
          presentCount: stats.presentCount,
          absentCount: stats.absentCount,
          attendanceRate: stats.attendanceRate,
          avgFocus: stats.avgFocus,
          homeworkCompletionRate: homeworkRate,
          homeworkComment,
          teacherReview,
          topics: stats.topics,
        }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BaoCao_${stats.studentName.replace(/\s+/g, "_")}_${stats.reportMonth}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Đã xuất PDF")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể tạo PDF"
      )
    } finally {
      setGenerating(false)
    }
  }

  async function exportExcel() {
    try {
      const XLSX = await import("xlsx")
      const summary = [
        { "Chỉ tiêu": "Học sinh", "Giá trị": stats.studentName },
        { "Chỉ tiêu": "Lớp", "Giá trị": stats.className },
        { "Chỉ tiêu": "Tháng", "Giá trị": formatMonth(stats.reportMonth) },
        { "Chỉ tiêu": "Tổng số buổi", "Giá trị": stats.totalLessons },
        { "Chỉ tiêu": "Có mặt", "Giá trị": stats.presentCount },
        { "Chỉ tiêu": "Vắng", "Giá trị": stats.absentCount },
        { "Chỉ tiêu": "Tỷ lệ chuyên cần (%)", "Giá trị": stats.attendanceRate },
        { "Chỉ tiêu": "Hoàn thành BTVN (%)", "Giá trị": homeworkRate },
      ]
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(summary),
        "Tổng kết"
      )
      const topicsSheet = stats.topics.map((t) => ({
        Ngày: t.date.slice(0, 10),
        "Chủ đề": t.topic,
        "Kiến thức": t.coreKnowledge,
        BTVN: t.homework,
      }))
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(topicsSheet.length ? topicsSheet : [{ Ngày: "" }]),
        "Nội dung học"
      )
      XLSX.writeFile(
        wb,
        `BaoCao_${stats.studentName.replace(/\s+/g, "_")}_${stats.reportMonth}.xlsx`
      )
      toast.success("Đã xuất Excel")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xuất Excel")
    }
  }

  const pieData = [
    {
      name: ATTENDANCE_STATUS_LABEL.PRESENT,
      value: stats.presentCount,
      color: "var(--chart-2)",
    },
    {
      name: ATTENDANCE_STATUS_LABEL.ABSENT,
      value: stats.absentCount,
      color: "var(--chart-5)",
    },
  ]

  const radarData = [
    { criterion: "Tiếp thu", value: stats.avgFocus },
    { criterion: "Tập trung", value: stats.avgFocus },
    {
      criterion: "Tinh thần",
      value: Math.round((stats.attendanceRate / 20) * 10) / 10,
    },
    {
      criterion: "Kỹ năng",
      value: Math.round((homeworkRate / 20) * 10) / 10,
    },
    { criterion: "Thái độ", value: stats.avgFocus },
  ]

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-extrabold text-foreground">Phân bố chuyên cần</CardTitle>
            <CardDescription className="text-xs font-semibold">
              {stats.studentName} &middot; {formatMonth(stats.reportMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AttendancePie data={pieData} />
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-secondary/70 border border-border/60 p-2.5">
                <p className="text-xl font-black text-foreground">{stats.totalLessons}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Tổng buổi</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.attendanceRate}%
                </p>
                <p className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mt-0.5">Chuyên cần</p>
              </div>
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-2.5">
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{stats.avgFocus}/5</p>
                <p className="text-[10px] font-bold text-indigo-600/80 dark:text-indigo-400/80 uppercase tracking-wider mt-0.5">Tập trung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-extrabold text-foreground">Biểu đồ năng lực học tập</CardTitle>
            <CardDescription className="text-xs font-semibold">Đánh giá 5 chiều theo thang điểm 0–5</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <EvaluationRadar data={radarData} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base font-extrabold text-foreground">
            Chi tiết các buổi học trong tháng
          </CardTitle>
          <CardDescription className="text-xs font-semibold">
            Nội dung đã học theo từng buổi của {stats.studentName} &middot;{" "}
            {formatMonth(stats.reportMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <LessonHistoryTable lessons={stats.sessions} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base font-extrabold text-foreground">Hoàn thiện phiếu báo cáo tháng</CardTitle>
          <CardDescription className="text-xs font-semibold">
            Nhập tỷ lệ bài tập, nhận xét rồi bấm lưu hoặc xuất file gửi phụ huynh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hwrate" className="text-xs font-bold text-foreground">Tỷ lệ hoàn thành BTVN (%)</Label>
              <Input
                id="hwrate"
                type="number"
                min={0}
                max={100}
                value={homeworkRate}
                onChange={(e) => setHomeworkRate(Number(e.target.value))}
                className="rounded-xl border-border/80 bg-background/50 text-xs font-semibold h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">Logo trung tâm (PDF Header)</Label>
              <div className="flex h-10 items-center rounded-xl border border-border/70 bg-background/40 px-4">
                <BrandLogo className="h-7" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hwcomment" className="text-xs font-bold text-foreground">Nhận xét chất lượng bài tập</Label>
            <Textarea
              id="hwcomment"
              value={homeworkComment}
              onChange={(e) => setHomeworkComment(e.target.value)}
              placeholder="Đánh giá mức độ hoàn thành và độ chính xác..."
              className="rounded-xl border-border/80 bg-background/50 text-xs font-medium"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review" className="text-xs font-bold text-foreground">Nhận xét tổng kết của giáo viên</Label>
            <Textarea
              id="review"
              value={teacherReview}
              onChange={(e) => setTeacherReview(e.target.value)}
              rows={3}
              placeholder="Lời khuyên, ưu điểm nổi bật và mục tiêu tháng tiếp theo..."
              className="rounded-xl border-border/80 bg-background/50 text-xs font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Button
              onClick={saveReport}
              disabled={isPending}
              className="rounded-xl font-bold text-xs h-10 gap-2 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-none transition-all cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Lưu báo cáo
            </Button>
            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={generating}
              className="rounded-xl font-bold text-xs h-10 gap-2 cursor-pointer bg-card/80 border-border/80 hover:bg-secondary"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <FileDown className="size-4 text-primary" />
              )}
              Xuất PDF gửi phụ huynh
            </Button>
            <Button
              variant="outline"
              onClick={exportExcel}
              className="rounded-xl font-bold text-xs h-10 gap-2 cursor-pointer bg-card/80 border-border/80 hover:bg-secondary"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

/**
 * Bảng chi tiết các buổi học của học sinh trong tháng báo cáo.
 */
function LessonHistoryTable({
  lessons,
}: {
  lessons: HistoryItem["lessons"]
}) {
  if (lessons.length === 0) {
    return (
      <div className="px-6 py-6 text-center text-xs font-semibold text-muted-foreground">
        Không có buổi học nào của lớp trong tháng này.
      </div>
    )
  }

  return (
    <div className="px-5 py-4">
      <div className="overflow-x-auto rounded-xl border border-border/70">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/40 text-left">
              <th className="w-14 px-3.5 py-2.5 text-center font-extrabold uppercase tracking-wider text-muted-foreground">Buổi</th>
              <th className="w-32 px-3.5 py-2.5 font-extrabold uppercase tracking-wider text-muted-foreground">Ngày học</th>
              <th className="px-3.5 py-2.5 font-extrabold uppercase tracking-wider text-muted-foreground">Nội dung bài học</th>
              <th className="px-3.5 py-2.5 font-extrabold uppercase tracking-wider text-muted-foreground">Kiến thức trọng tâm</th>
              <th className="w-28 px-3.5 py-2.5 text-center font-extrabold uppercase tracking-wider text-muted-foreground">
                Điểm danh
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {lessons.map((l, i) => (
              <tr
                key={`${l.date}-${i}`}
                className="align-top hover:bg-secondary/20 transition-colors"
              >
                <td className="px-3.5 py-2.5 text-center font-bold text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-3.5 py-2.5 font-semibold whitespace-nowrap text-foreground">
                  {formatDate(l.date)}
                </td>
                <td className="px-3.5 py-2.5 font-bold text-foreground">
                  {l.topic || (
                    <span className="text-muted-foreground/60 italic font-normal">
                      (chưa nhập chủ đề)
                    </span>
                  )}
                </td>
                <td className="px-3.5 py-2.5 text-muted-foreground font-medium">
                  {l.coreKnowledge || "—"}
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  <AttendanceBadge status={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AttendanceBadge({ status }: { status: string }) {
  if (status === "PRESENT") {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-lg px-2.5 py-0.5">
        <Check className="size-3 mr-1" strokeWidth={3} /> Có mặt
      </Badge>
    )
  }
  if (status === "ABSENT") {
    return (
      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs rounded-lg px-2.5 py-0.5">
        <XIcon className="size-3 mr-1" strokeWidth={3} /> Vắng
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="font-semibold text-xs rounded-lg px-2.5 py-0.5">
      <Minus className="size-3 mr-1" strokeWidth={3} /> Chưa điểm
    </Badge>
  )
}
