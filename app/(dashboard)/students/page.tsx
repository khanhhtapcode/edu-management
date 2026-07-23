import { db } from "@/lib/db"
import { StudentsClient } from "./_components/students-client"
import { ClassManager } from "./_components/class-manager"
import { PageHeading } from "@/components/page-heading"
import { UsersRound } from "lucide-react"

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
    username: s.username,
    sessionCount: s.sessionCount,
  }))

  const classOptions = classes.map((c) => ({ id: c.id, name: c.name }))

  return (
    <div className="space-y-6">
      <PageHeading
        icon={UsersRound}
        eyebrow="Học viên"
        title="Quản lý học sinh"
        description="Quản lý hồ sơ, lớp học và tiến độ từng học viên trong một nơi."
      >
        <ClassManager
          classes={classes.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            studentCount: c._count.students,
          }))}
        />
      </PageHeading>

      {classOptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center shadow-sm">
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
