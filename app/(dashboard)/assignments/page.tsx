import { db } from "@/lib/db"
import { AssignmentsClient } from "./_components/assignments-client"

export const dynamic = "force-dynamic"

export default async function AssignmentsPage() {
  const [classes, assignments] = await Promise.all([
    db.class.findMany({ orderBy: { name: "asc" } }),
    db.assignment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        classId: true,
        title: true,
        description: true,
        dueDate: true,
        createdAt: true,
        files: {
          select: { id: true, fileName: true, size: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
  ])

  return (
    <AssignmentsClient
      classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      assignments={assignments.map((a) => ({
        id: a.id,
        classId: a.classId,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate ? a.dueDate.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
        files: a.files,
      }))}
    />
  )
}
