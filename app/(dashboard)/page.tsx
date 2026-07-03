import {
  Users,
  Clock,
  ClipboardCheck,
  UserX,
  CalendarDays,
} from "lucide-react"
import { db } from "@/lib/db"
import { resolveRange, RANGE_LABELS } from "@/lib/date-range"
import { MEMBER_STATUS, ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABEL } from "@/lib/constants"
import { KpiCard } from "@/components/kpi-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AttendancePie } from "@/components/charts/attendance-pie"
import { AttendanceBar } from "@/components/charts/attendance-bar"
import { DashboardFilters } from "./_components/dashboard-filters"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

type SP = Promise<{ [key: string]: string | undefined }>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const sp = await searchParams
  const { start, end, preset } = resolveRange(sp.range, sp.from, sp.to)
  const classId = sp.classId
  const shiftId = sp.shiftId

  const [classes, shifts] = await Promise.all([
    db.class.findMany({ orderBy: { name: "asc" } }),
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
  ])

  const studentWhere = {
    status: MEMBER_STATUS.ACTIVE,
    ...(classId ? { classId } : {}),
  }

  const lessonWhere = {
    date: { gte: start, lt: end },
    ...(classId ? { classId } : {}),
    ...(shiftId ? { shiftId } : {}),
  }

  const attendanceWhere = {
    lesson: {
      date: { gte: start, lt: end },
      ...(classId ? { classId } : {}),
      ...(shiftId ? { shiftId } : {}),
    },
    ...(classId ? { student: { classId } } : {}),
  }

  const [activeStudents, totalShifts, lessonsInRange, attendances] =
    await Promise.all([
      db.student.count({ where: studentWhere }),
      db.shift.count(),
      db.lesson.count({ where: lessonWhere }),
      db.attendance.findMany({
        where: attendanceWhere,
        select: { status: true, student: { select: { classId: true } } },
      }),
    ])

  const counts = {
    PRESENT: 0,
    ABSENT: 0,
  }
  for (const a of attendances) {
    if (a.status in counts) counts[a.status as keyof typeof counts]++
  }
  const absent = counts.ABSENT

  const pieData = [
    { name: ATTENDANCE_STATUS_LABEL.PRESENT, value: counts.PRESENT, color: "var(--chart-2)" },
    { name: ATTENDANCE_STATUS_LABEL.ABSENT, value: counts.ABSENT, color: "var(--chart-5)" },
  ]

  // Tỷ lệ chuyên cần theo lớp (trong kỳ)
  const byClass = new Map<string, { present: number; total: number }>()
  for (const a of attendances) {
    if (a.status !== ATTENDANCE_STATUS.PRESENT && a.status !== ATTENDANCE_STATUS.ABSENT) {
      continue // bỏ qua "chưa điểm"
    }
    const cid = a.student.classId
    const entry = byClass.get(cid) ?? { present: 0, total: 0 }
    entry.total++
    if (a.status === ATTENDANCE_STATUS.PRESENT) {
      entry.present++
    }
    byClass.set(cid, entry)
  }
  const barData = classes
    .filter((c) => byClass.has(c.id))
    .map((c) => {
      const e = byClass.get(c.id)!
      return {
        label: c.name,
        rate: e.total ? Math.round((e.present / e.total) * 1000) / 10 : 0,
      }
    })

  const recentLessons = await db.lesson.findMany({
    where: lessonWhere,
    include: {
      shift: true,
      class: true,
      _count: { select: { attendances: true } },
    },
    orderBy: { date: "desc" },
    take: 5,
  })

  const rangeLabel = RANGE_LABELS[preset]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Tổng quan</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Báo cáo nhanh tình hình lớp học &middot; {rangeLabel}
          </p>
        </div>
        <DashboardFilters
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Tổng số học sinh"
          value={activeStudents}
          icon={Users}
          hint="Đang hoạt động"
          accent="primary"
        />
        <KpiCard
          title="Số ca học"
          value={totalShifts}
          icon={Clock}
          hint="Đã cấu hình"
          accent="info"
        />
        <KpiCard
          title="Buổi học trong kỳ"
          value={lessonsInRange}
          icon={ClipboardCheck}
          hint={rangeLabel}
          accent="success"
        />
        <KpiCard
          title="Lượt vắng mặt"
          value={absent}
          icon={UserX}
          hint={`Có mặt ${counts.PRESENT} lượt`}
          accent="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Phân bố điểm danh</CardTitle>
            <CardDescription>Theo trạng thái · {rangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendancePie data={pieData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tỷ lệ chuyên cần theo lớp</CardTitle>
            <CardDescription>
              Tỷ lệ có mặt trên tổng lượt đã điểm danh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceBar data={barData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            Buổi học gần đây
          </CardTitle>
          <CardDescription>{rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="size-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Không có buổi học nào trong khoảng thời gian này.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentLessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {l.class.name}
                      {l.topic ? ` · ${l.topic}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(l.date)} &middot; {l.shift.name} ({l.shift.startTime}–{l.shift.endTime})
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {l._count.attendances} điểm danh
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
