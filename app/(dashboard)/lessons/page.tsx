import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"
import { LessonsClient } from "./_components/lessons-client"

export const dynamic = "force-dynamic"

type SP = Promise<{ lessonId?: string }>

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const { lessonId } = await searchParams

  const [lessons, shifts] = await Promise.all([
    db.lesson.findMany({
      include: { shift: true },
      orderBy: { date: "desc" },
      take: 60,
    }),
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
  ])

  const selectedId = lessonId ?? lessons[0]?.id

  let detail: {
    id: string
    date: string
    shiftId: string
    shiftName: string
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
      include: { shift: true, comments: true },
    })
    if (lesson) {
      detail = {
        id: lesson.id,
        date: lesson.date.toISOString(),
        shiftId: lesson.shiftId,
        shiftName: lesson.shift.name,
        topic: lesson.topic,
        coreKnowledge: lesson.coreKnowledge,
        classWork: lesson.classWork ?? "",
        homework: lesson.homework ?? "",
      }
      const cMap = new Map(lesson.comments.map((c) => [c.studentId, c]))
      const students = await db.student.findMany({
        where: { shiftId: lesson.shiftId, status: MEMBER_STATUS.ACTIVE },
        include: { class: true },
        orderBy: { fullName: "asc" },
      })
      roster = students.map((s) => {
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
        <h2 className="text-xl font-bold tracking-tight">
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
          topic: l.topic,
          shiftName: l.shift.name,
        }))}
        shifts={shifts.map((s) => ({ id: s.id, name: s.name }))}
        detail={detail}
        roster={roster}
      />
    </div>
  )
}
