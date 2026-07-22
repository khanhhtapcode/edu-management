import {
  Users,
  Clock,
  ClipboardCheck,
  UserX,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
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
      continue
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
    <div className="space-y-6 pb-4">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/50 p-6 md:p-8 backdrop-blur-md shadow-sm">
        {/* Glow Circles Decorative Background */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-36 size-44 rounded-full bg-gradient-to-br from-pink-500/15 to-violet-500/15 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5 text-amber-500 animate-spin" />
              <span>Hệ thống Quản lý Lớp học EduTrack</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Xin chào, Quản trị viên! 👋
            </h1>
            <p className="text-sm font-medium text-muted-foreground max-w-xl">
              Dưới đây là báo cáo nhanh tình hình điểm danh, bài học & tỷ lệ chuyên cần &middot;{" "}
              <span className="font-semibold text-foreground">{rangeLabel}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild size="sm" className="gap-2 shadow-md shadow-primary/20 font-semibold cursor-pointer">
              <Link href="/students">
                <Users className="size-4" />
                Quản lý Học sinh
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2 font-medium bg-card/80 backdrop-blur-sm cursor-pointer">
              <Link href="/schedule">
                <GraduationCap className="size-4 text-primary" />
                Thời khóa biểu
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            Chỉ số hoạt động
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cập nhật theo bộ lọc bên phải
          </p>
        </div>
        <DashboardFilters
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* KPI Cards Grid */}
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
          hint="Đã cấu hình ca"
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

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 border-border/70 bg-gradient-to-br from-card to-card/95 backdrop-blur-md shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-bold">Phân bố điểm danh</CardTitle>
            <CardDescription className="text-xs">Theo trạng thái · {rangeLabel}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AttendancePie data={pieData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/70 bg-gradient-to-br from-card to-card/95 backdrop-blur-md shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-bold">Tỷ lệ chuyên cần theo lớp</CardTitle>
            <CardDescription className="text-xs">
              Tỷ lệ có mặt trên tổng lượt đã điểm danh
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AttendanceBar data={barData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Lessons Card */}
      <Card className="border-border/70 bg-card backdrop-blur-md shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <CalendarDays className="size-5 text-primary" />
              Buổi học gần đây
            </CardTitle>
            <CardDescription className="text-xs">{rangeLabel}</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary hover:text-primary cursor-pointer">
            <Link href="/schedule">
              Xem tất cả <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {recentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Không có buổi học nào trong khoảng thời gian này.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentLessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 hover:bg-secondary/40 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-card-foreground">
                      {l.class.name}
                      {l.topic ? ` · ${l.topic}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{formatDate(l.date)}</span>
                      <span>&middot;</span>
                      <span className="font-medium text-foreground/80">{l.shift.name} ({l.shift.startTime}–{l.shift.endTime})</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20">
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
