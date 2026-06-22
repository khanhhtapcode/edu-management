import { db } from "@/lib/db"
import { StudentsClient } from "./_components/students-client"
import { ClassManager } from "./_components/class-manager"

export const dynamic = "force-dynamic"

export default async function StudentsPage() {
  const [students, classes, shifts] = await Promise.all([
    db.student.findMany({
      include: { class: true, shift: true },
      orderBy: { createdAt: "desc" },
    }),
    db.class.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
    db.shift.findMany({ orderBy: { startTime: "asc" } }),
  ])

  const rows = students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    dateOfBirth: s.dateOfBirth.toISOString(),
    gender: s.gender,
    parentPhone: s.parentPhone,
    schoolName: s.schoolName,
    status: s.status,
    classId: s.classId,
    shiftId: s.shiftId,
    className: s.class.name,
    shiftName: s.shift?.name ?? null,
  }))

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }))
  const shiftOptions = shifts.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Quản lý học sinh</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý toàn diện hồ sơ học sinh từ nhập học đến kết thúc khóa.
          </p>
        </div>
        <ClassManager
          classes={classes.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            studentCount: c._count.students,
          }))}
        />
      </div>

      {classOptions.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="font-medium">Chưa có lớp học nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy tạo lớp học trước khi thêm học sinh (nút “Quản lý lớp” ở trên).
          </p>
        </div>
      ) : (
        <StudentsClient
          students={rows}
          classes={classOptions}
          shifts={shiftOptions}
        />
      )}
    </div>
  )
}
