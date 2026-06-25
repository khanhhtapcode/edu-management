import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"
import { computeMonthlyStats } from "@/lib/services/report-service"
import { formatDate } from "@/lib/utils"
import { ReportsClient, type ReportStats } from "./_components/reports-client"

export const dynamic = "force-dynamic"

type SP = Promise<{ studentId?: string; month?: string }>

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const sp = await searchParams
  const month = sp.month ?? currentMonth()

  const [students, reports] = await Promise.all([
    db.student.findMany({
      where: { status: MEMBER_STATUS.ACTIVE },
      include: { class: true },
      orderBy: { fullName: "asc" },
    }),
    db.monthlyReport.findMany({
      include: { student: { include: { class: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ])

  // Lấy chi tiết các buổi học (theo lớp + tháng) của từng báo cáo đã lưu,
  // dùng cho phần expand "Chi tiết buổi học" dưới mỗi dòng.
  const lessonsByReport: Record<
    string,
    {
      date: string
      topic: string
      coreKnowledge: string
      status: string
    }[]
  > = {}
  await Promise.all(
    reports.map(async (r) => {
      const [y, m] = r.reportMonth.split("-").map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 1)
      const lessons = await db.lesson.findMany({
        where: {
          classId: r.student.classId,
          date: { gte: start, lt: end },
        },
        include: {
          attendances: {
            where: { studentId: r.studentId },
            select: { status: true },
          },
        },
        orderBy: { date: "asc" },
      })
      lessonsByReport[r.id] = lessons.map((l) => ({
        date: l.date.toISOString(),
        topic: l.topic ?? "",
        coreKnowledge: l.coreKnowledge ?? "",
        status: l.attendances[0]?.status ?? "",
      }))
    })
  )

  const studentId = sp.studentId ?? students[0]?.id

  let stats: ReportStats | null = null
  if (studentId) {
    const s = await computeMonthlyStats(studentId, month)
    const existing = await db.monthlyReport.findUnique({
      where: { studentId_reportMonth: { studentId, reportMonth: month } },
    })
    stats = {
      studentId,
      studentName: s.student.fullName,
      className: s.student.class.name,
      reportMonth: month,
      totalLessons: s.totalLessons,
      presentCount: s.presentCount,
      absentCount: s.absentCount,
      attendanceRate: s.attendanceRate,
      avgFocus: s.avgFocus,
      topics: s.lessons.map((l) => ({
        date: l.date.toISOString(),
        topic: l.topic ?? "",
        coreKnowledge: l.coreKnowledge ?? "",
        homework: l.homework ?? "",
      })),
      existing: existing
        ? {
            homeworkCompletionRate: existing.homeworkCompletionRate,
            homeworkComment: existing.homeworkComment,
            teacherReview: existing.teacherReview,
          }
        : null,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Báo cáo, thống kê & xuất PDF
        </h2>
        <p className="text-sm text-muted-foreground">
          Tổng kết chuyên cần, đánh giá và xuất phiếu báo cáo tháng cho phụ
          huynh.
        </p>
      </div>

      <ReportsClient
        students={students.map((s) => ({
          id: s.id,
          name: s.fullName,
          className: s.class.name,
        }))}
        month={month}
        selectedStudentId={studentId ?? ""}
        stats={stats}
        history={reports.map((r) => ({
          id: r.id,
          studentName: r.student.fullName,
          className: r.student.class.name,
          reportMonth: r.reportMonth,
          attendanceRate: r.attendanceRate,
          createdAt: formatDate(r.createdAt),
          lessons: lessonsByReport[r.id] ?? [],
        }))}
      />
    </div>
  )
}
