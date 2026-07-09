import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate, formatFileSize } from "@/lib/utils"
import { FileText, Download, CalendarClock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StudentHomeworkPage() {
  const session = await auth()
  const classId = session?.user.classId

  const assignments = classId
    ? await db.assignment.findMany({
        where: { classId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          createdAt: true,
          files: {
            select: { id: true, fileName: true, size: true },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Bài tập về nhà
        </h2>
        <p className="text-sm text-muted-foreground">
          Tải file bài tập giáo viên gửi cho lớp của bạn.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          Hiện chưa có bài tập nào.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <h3 className="font-semibold text-foreground">{a.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Gửi ngày {formatDate(a.createdAt)}
                {a.dueDate && (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-600">
                    <CalendarClock className="size-3" /> Hạn {formatDate(a.dueDate)}
                  </span>
                )}
              </p>
              {a.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {a.description}
                </p>
              )}
              <div className="mt-3 space-y-1">
                {a.files.map((f) => (
                  <a
                    key={f.id}
                    href={`/api/assignments/files/${f.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{f.fileName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {formatFileSize(f.size)}
                      <Download className="size-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
