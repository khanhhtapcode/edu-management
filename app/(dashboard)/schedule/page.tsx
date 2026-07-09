import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"
import { toDateInputValue } from "@/lib/utils"
import { generateLessonsForWeek } from "@/lib/services/class-schedule-service"
import { ScheduleClient } from "./_components/schedule-client"

export const dynamic = "force-dynamic"

type SP = Promise<{ week?: string }>

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

function weekStartOf(d: Date) {
  const day = d.getDay() === 0 ? 7 : d.getDay() // Mon=1..Sun=7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - (day - 1))
}

function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: SP
}) {
  const { week } = await searchParams

  const base = week ? new Date(week) : new Date()
  const weekStart = weekStartOf(Number.isNaN(base.getTime()) ? new Date() : base)
  const weekEnd = addDays(weekStart, 7)
  const todayKey = toDateInputValue(new Date())

  await generateLessonsForWeek(weekStart)

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i)
    const key = toDateInputValue(date)
    return {
      key,
      label: DAY_LABELS[i],
      dayNum: `${date.getDate()}/${date.getMonth() + 1}`,
      isToday: key === todayKey,
    }
  })

  const [shifts, lessons, classes, students, classSchedules] = await Promise.all([
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
    db.lesson.findMany({
      where: { date: { gte: weekStart, lt: weekEnd } },
      include: {
        class: true,
        attendances: {
          include: { student: true },
          orderBy: { student: { fullName: "asc" } },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.class.findMany({ orderBy: { name: "asc" } }),
    db.student.findMany({
      where: { status: MEMBER_STATUS.ACTIVE },
      include: { class: true },
      orderBy: { fullName: "asc" },
    }),
    db.classSchedule.findMany(),
  ])

  const cellLessons = lessons.map((l) => ({
    id: l.id,
    shiftId: l.shiftId,
    dateKey: toDateInputValue(l.date),
    classId: l.classId,
    className: l.class.name,
    topic: l.topic,
    students: l.attendances.map((a) => ({
      studentId: a.studentId,
      fullName: a.student.fullName,
      status: a.status,
    })),
  }))

  return (
    <ScheduleClient
      weekStartKey={toDateInputValue(weekStart)}
      prevWeekKey={toDateInputValue(addDays(weekStart, -7))}
      nextWeekKey={toDateInputValue(addDays(weekStart, 7))}
      thisWeekKey={toDateInputValue(weekStartOf(new Date()))}
      days={days}
      shifts={shifts.map((s) => ({
        id: s.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
      }))}
      lessons={cellLessons}
      classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      students={students.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        classId: s.classId,
        className: s.class.name,
      }))}
      classSchedules={classSchedules.map((cs) => ({
        classId: cs.classId,
        shiftId: cs.shiftId,
        dayOfWeek: cs.dayOfWeek,
      }))}
    />
  )
}
