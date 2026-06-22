import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"
import { AttendanceClient } from "./_components/attendance-client"

export const dynamic = "force-dynamic"

type SP = Promise<{ lessonId?: string }>

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: SP
}) {
  const { lessonId } = await searchParams

  const [lessons, shifts] = await Promise.all([
    db.lesson.findMany({
      include: {
        shift: true,
        _count: { select: { attendances: true } },
      },
      orderBy: { date: "desc" },
      take: 60,
    }),
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
  ])

  const selectedId = lessonId ?? lessons[0]?.id

  let roster: {
    studentId: string
    fullName: string
    className: string
    status: string
    lateMinutes: number
  }[] = []
  let selectedLesson: {
    id: string
    date: string
    topic: string
    shiftName: string
    shiftTime: string
  } | null = null

  if (selectedId) {
    const lesson = await db.lesson.findUnique({
      where: { id: selectedId },
      include: {
        shift: true,
        attendances: true,
      },
    })
    if (lesson) {
      selectedLesson = {
        id: lesson.id,
        date: lesson.date.toISOString(),
        topic: lesson.topic,
        shiftName: lesson.shift.name,
        shiftTime: `${lesson.shift.startTime}–${lesson.shift.endTime}`,
      }
      const attMap = new Map(lesson.attendances.map((a) => [a.studentId, a]))

      const shiftStudents = await db.student.findMany({
        where: { shiftId: lesson.shiftId, status: MEMBER_STATUS.ACTIVE },
        include: { class: true },
        orderBy: { fullName: "asc" },
      })
      const ids = new Set(shiftStudents.map((s) => s.id))

      // Học sinh đã điểm danh nhưng không còn ở ca (đổi ca)
      const extraIds = lesson.attendances
        .map((a) => a.studentId)
        .filter((id) => !ids.has(id))
      const extraStudents = extraIds.length
        ? await db.student.findMany({
            where: { id: { in: extraIds } },
            include: { class: true },
          })
        : []

      roster = [...shiftStudents, ...extraStudents].map((s) => {
        const a = attMap.get(s.id)
        return {
          studentId: s.id,
          fullName: s.fullName,
          className: s.class.name,
          status: a?.status ?? "",
          lateMinutes: a?.lateMinutes ?? 0,
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Điểm danh buổi học</h2>
        <p className="text-sm text-muted-foreground">
          Chọn buổi học để điểm danh nhanh học sinh trong ca. Thao tác một chạm.
        </p>
      </div>

      <AttendanceClient
        lessons={lessons.map((l) => ({
          id: l.id,
          date: l.date.toISOString(),
          topic: l.topic,
          shiftName: l.shift.name,
          attendanceCount: l._count.attendances,
        }))}
        shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        selectedLesson={selectedLesson}
        roster={roster}
      />
    </div>
  )
}
