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
    <div className="space-y-5">
      <div className="border-b border-border/60 pb-3">
        <h2 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <span>Bài tập về nhà</span>
        </h2>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
          Tải file bài tập giáo viên gửi cho lớp để ôn luyện và làm bài.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/90 backdrop-blur-xl p-12 text-center text-sm font-semibold text-muted-foreground shadow-xs">
          Hiện chưa có bài tập nào được giao cho lớp của bạn.
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground tracking-tight">{a.title}</h3>
                <p className="mt-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <span>Gửi ngày {formatDate(a.createdAt)}</span>
                  {a.dueDate && (
                    <>
                      <span>&middot;</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <CalendarClock className="size-3" /> Hạn {formatDate(a.dueDate)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {a.description && (
                <p className="whitespace-pre-wrap text-xs font-medium text-muted-foreground leading-relaxed">
                  {a.description}
                </p>
              )}

              <div className="space-y-2 pt-2 border-t border-border/50">
                {a.files.map((f) => (
                  <a
                    key={f.id}
                    href={`/api/assignments/files/${f.id}`}
                    className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs font-semibold transition-all hover:bg-secondary/80 hover:border-primary/30"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-primary transition-transform group-hover:scale-110" />
                      <span className="truncate text-foreground font-bold">{f.fileName}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold text-muted-foreground group-hover:text-primary">
                      {formatFileSize(f.size)}
                      <Download className="size-3.5" />
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
