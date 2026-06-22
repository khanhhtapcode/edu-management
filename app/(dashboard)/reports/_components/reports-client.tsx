"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileDown,
  FileSpreadsheet,
  Save,
  Loader2,
  Trash2,
  CalendarRange,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api-client"
import { formatMonth } from "@/lib/utils"
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

export type ReportStats = {
  studentId: string
  studentName: string
  className: string
  parentPhone: string
  reportMonth: string
  totalLessons: number
  presentCount: number
  excusedCount: number
  unexcusedCount: number
  lateCount: number
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
  const [generating, setGenerating] = useState(false)

  const [homeworkRate, setHomeworkRate] = useState(0)
  const [homeworkComment, setHomeworkComment] = useState("")
  const [teacherReview, setTeacherReview] = useState("")
  const [logo, setLogo] = useState<string | undefined>()

  useEffect(() => {
    setHomeworkRate(stats?.existing?.homeworkCompletionRate ?? 0)
    setHomeworkComment(stats?.existing?.homeworkComment ?? "")
    setTeacherReview(stats?.existing?.teacherReview ?? "")
  }, [stats])

  function navigate(next: { studentId?: string; month?: string }) {
    const sid = next.studentId ?? selectedStudentId
    const m = next.month ?? month
    const sp = new URLSearchParams()
    if (sid) sp.set("studentId", sid)
    sp.set("month", m)
    router.push(`/reports?${sp.toString()}`)
  }

  function saveReport() {
    if (!stats) return
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

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function exportPdf() {
    if (!stats) return
    setGenerating(true)
    try {
      const { generateReportPdf } = await import("@/lib/report-pdf")
      const blob = await generateReportPdf(
        {
          studentName: stats.studentName,
          className: stats.className,
          parentPhone: stats.parentPhone,
          reportMonth: stats.reportMonth,
          totalLessons: stats.totalLessons,
          presentCount: stats.presentCount,
          excusedCount: stats.excusedCount,
          unexcusedCount: stats.unexcusedCount,
          lateCount: stats.lateCount,
          attendanceRate: stats.attendanceRate,
          avgFocus: stats.avgFocus,
          homeworkCompletionRate: homeworkRate,
          homeworkComment,
          teacherReview,
          topics: stats.topics,
        },
        logo
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
    if (!stats) return
    try {
      const XLSX = await import("xlsx")
      const summary = [
        { "Chỉ tiêu": "Học sinh", "Giá trị": stats.studentName },
        { "Chỉ tiêu": "Lớp", "Giá trị": stats.className },
        { "Chỉ tiêu": "Tháng", "Giá trị": formatMonth(stats.reportMonth) },
        { "Chỉ tiêu": "Tổng số buổi", "Giá trị": stats.totalLessons },
        { "Chỉ tiêu": "Có mặt", "Giá trị": stats.presentCount },
        { "Chỉ tiêu": "Đi muộn", "Giá trị": stats.lateCount },
        { "Chỉ tiêu": "Vắng có phép", "Giá trị": stats.excusedCount },
        { "Chỉ tiêu": "Vắng không phép", "Giá trị": stats.unexcusedCount },
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

  const pieData = stats
    ? [
        { name: ATTENDANCE_STATUS_LABEL.PRESENT, value: stats.presentCount - stats.lateCount, color: "var(--chart-2)" },
        { name: ATTENDANCE_STATUS_LABEL.LATE, value: stats.lateCount, color: "var(--chart-4)" },
        { name: ATTENDANCE_STATUS_LABEL.EXCUSED, value: stats.excusedCount, color: "var(--chart-3)" },
        { name: ATTENDANCE_STATUS_LABEL.UNEXCUSED, value: stats.unexcusedCount, color: "var(--chart-5)" },
      ]
    : []

  const radarData = stats
    ? [
        { criterion: "Tập trung", value: stats.avgFocus },
        { criterion: "Chuyên cần", value: Math.round((stats.attendanceRate / 20) * 10) / 10 },
        { criterion: "Bài tập", value: Math.round((homeworkRate / 20) * 10) / 10 },
      ]
    : []

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

          {/* Form nhập + export */}
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
                  <Label htmlFor="logo">Logo lớp/trung tâm (PDF)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={onLogoChange}
                      className="cursor-pointer"
                    />
                    {logo && <Badge variant="success">Đã tải</Badge>}
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
                  <TableHead>Học sinh</TableHead>
                  <TableHead>Lớp</TableHead>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Chuyên cần</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">
                      {h.studentName}
                    </TableCell>
                    <TableCell>{h.className}</TableCell>
                    <TableCell>{formatMonth(h.reportMonth)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{h.attendanceRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {h.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
