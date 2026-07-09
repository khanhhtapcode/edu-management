import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudentHeader } from "./_components/student-header"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "student") {
    redirect("/login")
  }

  const student = session.user.studentId
    ? await db.student.findUnique({
        where: { id: session.user.studentId },
        select: { fullName: true, class: { select: { name: true } } },
      })
    : null

  return (
    <div className="min-h-svh bg-background">
      <StudentHeader
        fullName={student?.fullName ?? session.user.name ?? "Học sinh"}
        className={student?.class.name ?? "—"}
      />
      <main className="mx-auto max-w-3xl p-4 md:p-6">{children}</main>
    </div>
  )
}
