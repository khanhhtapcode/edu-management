import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate, formatMonth } from "@/lib/utils"
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABEL,
} from "@/lib/constants"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function StudentProfilePage() {
  const session = await auth()
  const studentId = session?.user.studentId

  const [attendances, comments, reports] = studentId
    ? await Promise.all([
        db.attendance.findMany({
          where: { studentId, status: { not: "" } },
          include: { lesson: { select: { date: true, topic: true } } },
          orderBy: { lesson: { date: "desc" } },
          take: 50,
        }),
        db.studentComment.findMany({
          where: { studentId },
          include: { lesson: { select: { date: true, topic: true } } },
          orderBy: { lesson: { date: "desc" } },
          take: 30,
        }),
        db.monthlyReport.findMany({
          where: { studentId },
          orderBy: { reportMonth: "desc" },
        }),
      ])
    : [[], [], []]

  const presentCount = attendances.filter(
    (a) => a.status === ATTENDANCE_STATUS.PRESENT
  ).length
  const total = attendances.length
  const rate = total > 0 ? Math.round((presentCount / total) * 1000) / 10 : 0

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Thông tin học tập
        </h2>
        <p className="text-sm text-muted-foreground">
          Điểm danh, nhận xét và báo cáo tháng của bạn.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Buổi đã điểm danh" value={String(total)} />
        <StatTile label="Có mặt" value={String(presentCount)} />
        <StatTile label="Tỉ lệ đi học" value={`${rate}%`} />
      </div>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Điểm danh</TabsTrigger>
          <TabsTrigger value="comments">Nhận xét</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo tháng</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-2">
          {attendances.length === 0 ? (
            <Empty>Chưa có dữ liệu điểm danh.</Empty>
          ) : (
            attendances.map((a) => (
              <Row
                key={a.id}
                left={formatDate(a.lesson.date)}
                middle={a.lesson.topic || "—"}
                right={
                  <Badge
                    variant={
                      a.status === ATTENDANCE_STATUS.PRESENT
                        ? "default"
                        : "destructive"
                    }
                  >
                    {ATTENDANCE_STATUS_LABEL[a.status] ?? a.status}
                  </Badge>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-2">
          {comments.length === 0 ? (
            <Empty>Chưa có nhận xét nào.</Empty>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {formatDate(c.lesson.date)}
                  </span>
                  <Badge variant="secondary">Tập trung {c.focusScore}/5</Badge>
                </div>
                {c.lesson.topic && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.lesson.topic}
                  </p>
                )}
                <dl className="mt-2 space-y-1 text-sm">
                  <CommentLine label="Thái độ" value={c.attitude} />
                  <CommentLine label="Tiếp thu" value={c.reception} />
                  {c.improvement && (
                    <CommentLine label="Cần cải thiện" value={c.improvement} />
                  )}
                </dl>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-2">
          {reports.length === 0 ? (
            <Empty>Chưa có báo cáo tháng nào.</Empty>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {formatMonth(r.reportMonth)}
                  </span>
                  <Badge variant="secondary">
                    Đi học {r.attendanceRate}%
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.presentCount}/{r.totalLessons} buổi có mặt · Hoàn thành BTVN{" "}
                  {r.homeworkCompletionRate}%
                </p>
                {r.teacherReview && (
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    {r.teacherReview}
                  </p>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function Row({
  left,
  middle,
  right,
}: {
  left: string
  middle: string
  right: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm">
      <span className="w-24 shrink-0 font-medium text-foreground">{left}</span>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        {middle}
      </span>
      {right}
    </div>
  )
}

function CommentLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 whitespace-pre-wrap text-foreground">
        {value || "—"}
      </dd>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}
