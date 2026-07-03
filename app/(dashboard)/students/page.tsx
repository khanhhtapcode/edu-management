import { db } from "@/lib/db"
import { StudentsClient } from "./_components/students-client"
import { ClassManager } from "./_components/class-manager"

export const dynamic = "force-dynamic"

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    db.student.findMany({
      include: { class: true },
      orderBy: { createdAt: "desc" },
    }),
    db.class.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
  ])

  const rows = students.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    gender: s.gender,
    schoolName: s.schoolName,
    status: s.status,
    classId: s.classId,
    className: s.class.name,
  }))

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Quản lý học sinh</h2>
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
        <StudentsClient students={rows} classes={classOptions} />
      )}
    </div>
  )
}
