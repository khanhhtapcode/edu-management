import { db } from "@/lib/db"
import { LessonsClient } from "./_components/lessons-client"

export const dynamic = "force-dynamic"

type SP = Promise<{ lessonId?: string }>

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const { lessonId } = await searchParams

  const [lessons, shifts, classes] = await Promise.all([
    db.lesson.findMany({
      include: { shift: true, class: true },
      orderBy: { date: "desc" },
      take: 60,
    }),
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
    db.class.findMany({ orderBy: { name: "asc" } }),
  ])

  const selectedId = lessonId ?? lessons[0]?.id

  let detail: {
    id: string
    date: string
    shiftName: string
    className: string
    topic: string
    coreKnowledge: string
    classWork: string
    homework: string
  } | null = null
  let roster: {
    studentId: string
    fullName: string
    className: string
    focusScore: number
    attitude: string
    reception: string
    improvement: string
  }[] = []

  if (selectedId) {
    const lesson = await db.lesson.findUnique({
      where: { id: selectedId },
      include: {
        shift: true,
        class: true,
        comments: true,
        attendances: {
          include: { student: { include: { class: true } } },
        },
      },
    })
    if (lesson) {
      detail = {
        id: lesson.id,
        date: lesson.date.toISOString(),
        shiftName: lesson.shift.name,
        className: lesson.class.name,
        topic: lesson.topic ?? "",
        coreKnowledge: lesson.coreKnowledge ?? "",
        classWork: lesson.classWork ?? "",
        homework: lesson.homework ?? "",
      }
      const cMap = new Map(lesson.comments.map((c) => [c.studentId, c]))
      roster = lesson.attendances
        .map((a) => a.student)
        .sort((x, y) => x.fullName.localeCompare(y.fullName, "vi"))
        .map((s) => {
          const c = cMap.get(s.id)
          return {
            studentId: s.id,
            fullName: s.fullName,
            className: s.class.name,
            focusScore: c?.focusScore ?? 5,
            attitude: c?.attitude ?? "",
            reception: c?.reception ?? "",
            improvement: c?.improvement ?? "",
          }
        })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Nhật ký bài học & nhận xét
        </h2>
        <p className="text-sm text-muted-foreground">
          Ghi nhận nội dung giảng dạy và đánh giá chi tiết từng học sinh.
        </p>
      </div>

      <LessonsClient
        lessons={lessons.map((l) => ({
          id: l.id,
          date: l.date.toISOString(),
          topic: l.topic ?? "",
          className: l.class.name,
          shiftName: l.shift.name,
        }))}
        shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        detail={detail}
        roster={roster}
      />
    </div>
  )
}
