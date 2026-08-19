import {
  Users,
  Clock,
  ClipboardCheck,
  UserX,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  BookOpen,
  TrendingUp,
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
      attendances: {
        select: { status: true },
      },
      _count: { select: { attendances: true } },
    },
    orderBy: { date: "desc" },
    take: 5,
  })

  const rangeLabel = RANGE_LABELS[preset]

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-pink-600/15 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-slate-900/70 p-7 md:p-9 backdrop-blur-xl shadow-md">
        {/* Glow Circles Decorative Background */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-64 rounded-full bg-gradient-to-br from-indigo-500/25 to-purple-500/25 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-12 right-40 size-48 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary shadow-xs">
              <Sparkles className="size-3.5 text-amber-400 animate-pulse" />
              <span>Edu Management Dashboard</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl lg:text-4xl">
              Xin chào, Quản trị viên! 👋
            </h1>
            <p className="text-sm font-semibold text-muted-foreground max-w-xl leading-relaxed">
              Báo cáo thời gian thực về điểm danh, tiến độ bài học & chuyên cần lớp Toán &middot;{" "}
              <span className="font-extrabold text-foreground underline decoration-primary/40 underline-offset-4">{rangeLabel}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="sm" className="gap-2 shadow-lg shadow-indigo-500/25 font-bold rounded-xl cursor-pointer bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-none transition-all">
              <Link href="/students">
                <Users className="size-4" />
                Quản lý Học sinh
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2 font-semibold rounded-xl bg-card/80 backdrop-blur-md cursor-pointer border-border/80 hover:bg-secondary transition-all">
              <Link href="/schedule">
                <GraduationCap className="size-4 text-primary" />
                Thời khóa biểu
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button asChild variant="outline" className="h-auto py-3 px-4 rounded-2xl bg-card/85 border-border/70 hover:border-primary/40 hover:bg-secondary/80 flex flex-col items-start gap-1 text-left transition-all group">
          <Link href="/schedule">
            <span className="flex items-center gap-2 text-xs font-black text-foreground group-hover:text-primary">
              <Clock className="size-4 text-indigo-500" />
              Điểm danh hôm nay
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Vào thời khóa biểu tuần</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 px-4 rounded-2xl bg-card/85 border-border/70 hover:border-primary/40 hover:bg-secondary/80 flex flex-col items-start gap-1 text-left transition-all group">
          <Link href="/students">
            <span className="flex items-center gap-2 text-xs font-black text-foreground group-hover:text-primary">
              <Users className="size-4 text-emerald-500" />
              Quản lý học sinh
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Hồ sơ & sĩ số lớp</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 px-4 rounded-2xl bg-card/85 border-border/70 hover:border-primary/40 hover:bg-secondary/80 flex flex-col items-start gap-1 text-left transition-all group">
          <Link href="/assignments">
            <span className="flex items-center gap-2 text-xs font-black text-foreground group-hover:text-primary">
              <BookOpen className="size-4 text-purple-500" />
              Giao bài tập
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Gửi tài liệu cho lớp</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-3 px-4 rounded-2xl bg-card/85 border-border/70 hover:border-primary/40 hover:bg-secondary/80 flex flex-col items-start gap-1 text-left transition-all group">
          <Link href="/reports">
            <span className="flex items-center gap-2 text-xs font-black text-foreground group-hover:text-primary">
              <TrendingUp className="size-4 text-pink-500" />
              Xuất báo cáo PDF
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Tổng kết & chuyên cần</span>
          </Link>
        </Button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="size-4.5 text-primary" />
            Chỉ số hoạt động trung tâm
          </h2>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            Dữ liệu tổng hợp theo khoảng thời gian và bộ lọc ca học
          </p>
        </div>
        <DashboardFilters
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Tổng số học sinh"
          value={activeStudents}
          icon={Users}
          hint="Đang học tập"
          accent="primary"
        />
        <KpiCard
          title="Ca học hệ thống"
          value={totalShifts}
          icon={Clock}
          hint="Đã thiết lập ca"
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
        <Card className="lg:col-span-2 border-border/70 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl shadow-xs rounded-2xl overflow-hidden border">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-extrabold">Phân bố điểm danh</CardTitle>
            <CardDescription className="text-xs font-semibold">Tỷ lệ có mặt vs vắng mặt &middot; {rangeLabel}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AttendancePie data={pieData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/70 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl shadow-xs rounded-2xl overflow-hidden border">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-extrabold">Tỷ lệ chuyên cần theo lớp</CardTitle>
            <CardDescription className="text-xs font-semibold">
              Tỷ lệ học sinh đi học đầy đủ phân theo từng nhóm lớp
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <AttendanceBar data={barData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Lessons Card */}
      <Card className="border-border/70 bg-card/90 backdrop-blur-xl shadow-xs rounded-2xl overflow-hidden border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
          <div className="space-y-0.5">
            <CardTitle className="flex items-center gap-2 text-base font-extrabold">
              <CalendarDays className="size-5 text-primary" />
              Buổi học gần đây
            </CardTitle>
            <CardDescription className="text-xs font-semibold">{rangeLabel}</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs font-extrabold text-primary hover:text-primary cursor-pointer rounded-xl hover:bg-primary/10">
            <Link href="/schedule">
              Xem tất cả <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {recentLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="size-12 text-muted-foreground/25 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                Không tìm thấy buổi học nào trong khoảng thời gian này.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {recentLessons.map((l) => {
                const totalAtt = l.attendances.length
                const presentAtt = l.attendances.filter((a) => a.status === ATTENDANCE_STATUS.PRESENT).length
                const absentAtt = l.attendances.filter((a) => a.status === ATTENDANCE_STATUS.ABSENT).length

                return (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 hover:bg-secondary/60 px-3 rounded-xl transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-card-foreground">
                        {l.class.name}
                        {l.topic ? ` · ${l.topic}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="font-semibold">{formatDate(l.date)}</span>
                        <span>&middot;</span>
                        <span className="font-bold text-foreground/80">{l.shift.name} ({l.shift.startTime}–{l.shift.endTime})</span>
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {totalAtt > 0 ? (
                        <Badge
                          variant="secondary"
                          className={
                            absentAtt === 0
                              ? "text-xs font-extrabold px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 rounded-lg"
                              : "text-xs font-extrabold px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 rounded-lg"
                          }
                        >
                          {presentAtt}/{totalAtt} có mặt {absentAtt > 0 ? `· ${absentAtt} vắng` : ""}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 text-muted-foreground border border-border/70 rounded-lg">
                          Chưa điểm danh
                        </Badge>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

