import { db } from "@/lib/db"
import { MEMBER_STATUS } from "@/lib/constants"
import { ShiftsClient } from "./_components/shifts-client"

export const dynamic = "force-dynamic"

export default async function ShiftsPage() {
  const [shifts, students] = await Promise.all([
    db.shift.findMany({
      include: { _count: { select: { students: true, lessons: true } } },
      orderBy: { startTime: "asc" },
    }),
    db.student.findMany({
      where: { status: MEMBER_STATUS.ACTIVE },
      include: { class: true },
      orderBy: { fullName: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Quản lý ca học</h2>
        <p className="text-sm text-muted-foreground">
          Thiết lập thời gian biểu và gán học sinh vào từng ca học cố định.
        </p>
      </div>

      <ShiftsClient
        shifts={shifts.map((s) => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          studentCount: s._count.students,
          lessonCount: s._count.lessons,
        }))}
        students={students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          className: s.class.name,
          shiftId: s.shiftId,
        }))}
      />
    </div>
  )
}
