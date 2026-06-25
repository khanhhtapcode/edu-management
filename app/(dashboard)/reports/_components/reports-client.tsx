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
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Học sinh</Label>
            <Select
              value={selectedStudentId}
              onValueChange={(v) => navigate({ studentId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn học sinh" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} · {s.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full space-y-2 sm:w-56">
            <Label>Tháng tổng kết</Label>
            <Select value={month} onValueChange={(v) => navigate({ month: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Chọn học sinh để xem thống kê và tạo phiếu báo cáo tháng.
        </div>
      ) : (
        <ReportStatsPanel
          key={`${stats.studentId}-${stats.reportMonth}`}
          stats={stats}
        />
      )}

      {/* Lịch sử báo cáo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="size-5 text-primary" />
            Nhật ký báo cáo đã lưu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Chưa có báo cáo nào được lưu.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Chuyên cần</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => {
                  const isOpen = !!expanded[h.id]
                  return (
                    <Fragment key={h.id}>
                      <TableRow
                        onClick={() => toggleExpand(h.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="text-muted-foreground">
                          {isOpen ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {h.studentName}
                        </TableCell>
                        <TableCell>{h.className}</TableCell>
                        <TableCell>{formatMonth(h.reportMonth)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {h.attendanceRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {h.createdAt}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
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
    {
      criterion: "Bài BTVN",
      value: Math.round((homeworkRate / 20) * 10) / 10,
    },
    { criterion: "Thái độ", value: stats.avgFocus },
  ]

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân bố chuyên cần</CardTitle>
            <CardDescription>
              {stats.studentName} · {formatMonth(stats.reportMonth)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendancePie data={pieData} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-muted p-2">
                <p className="text-lg font-bold">{stats.totalLessons}</p>
                <p className="text-xs text-muted-foreground">Tổng buổi</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-lg font-bold text-success">
                  {stats.attendanceRate}%
                </p>
                <p className="text-xs text-muted-foreground">Chuyên cần</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-lg font-bold">{stats.avgFocus}/5</p>
                <p className="text-xs text-muted-foreground">Tập trung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Biểu đồ đánh giá</CardTitle>
            <CardDescription>Thang điểm 0–5</CardDescription>
          </CardHeader>
          <CardContent>
            <EvaluationRadar data={radarData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hoàn thiện phiếu báo cáo</CardTitle>
          <CardDescription>
            Nhập tỷ lệ bài tập, nhận xét rồi lưu / xuất file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hwrate">Tỷ lệ hoàn thành BTVN (%)</Label>
              <Input
                id="hwrate"
                type="number"
                min={0}
                max={100}
                value={homeworkRate}
                onChange={(e) => setHomeworkRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Logo trung tâm (PDF)</Label>
              <div className="flex h-14 items-center rounded-lg border bg-muted/40 px-4">
                <BrandLogo className="h-10" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hwcomment">Nhận xét chất lượng bài tập</Label>
            <Textarea
              id="hwcomment"
              value={homeworkComment}
              onChange={(e) => setHomeworkComment(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Nhận xét tổng kết của giáo viên</Label>
            <Textarea
              id="review"
              value={teacherReview}
              onChange={(e) => setTeacherReview(e.target.value)}
              rows={4}
              placeholder="Lời khuyên, tổng kết cuối tháng..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveReport} disabled={isPending}>
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
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              Xuất PDF
            </Button>
            <Button variant="outline" onClick={exportExcel}>
              <FileSpreadsheet className="size-4" />
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
 * Cột: Buổi · Ngày học · Nội dung bài học · Ghi chú · Điểm danh.
 */
function LessonHistoryTable({
  lessons,
}: {
  lessons: HistoryItem["lessons"]
}) {
  if (lessons.length === 0) {
    return (
      <div className="px-6 py-4 text-sm text-muted-foreground">
        Không có buổi học nào của lớp trong tháng này.
      </div>
    )
  }

  return (
    <div className="px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Chi tiết buổi học
      </p>
      <div className="overflow-x-auto rounded-md border bg-background">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="w-14 px-3 py-2 text-center font-semibold">Buổi</th>
              <th className="w-32 px-3 py-2 font-semibold">Ngày học</th>
              <th className="px-3 py-2 font-semibold">Nội dung bài học</th>
              <th className="px-3 py-2 font-semibold">Ghi chú</th>
              <th className="w-28 px-3 py-2 text-center font-semibold">
                Điểm danh
              </th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l, i) => (
              <tr
                key={`${l.date}-${i}`}
                className="border-b last:border-b-0 align-top"
              >
                <td className="px-3 py-2 text-center text-muted-foreground">
                  {i + 1}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {formatDate(l.date)}
                </td>
                <td className="px-3 py-2">
                  {l.topic || (
                    <span className="text-muted-foreground italic">
                      (chưa nhập)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {l.coreKnowledge || "—"}
                </td>
                <td className="px-3 py-2 text-center">
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
      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700">
        <Check className="size-3" strokeWidth={3} /> Có mặt
      </span>
    )
  }
  if (status === "ABSENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-700">
        <XIcon className="size-3" strokeWidth={3} /> Vắng
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
      <Minus className="size-3" strokeWidth={3} /> Chưa điểm
    </span>
  )
}
