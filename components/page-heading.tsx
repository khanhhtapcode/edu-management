import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type PageHeadingProps = {
  icon: LucideIcon
  eyebrow?: string
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function PageHeading({
  icon: Icon,
  eyebrow = "Quản lý lớp học",
  title,
  description,
  children,
  className,
}: PageHeadingProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 px-5 py-5 shadow-sm backdrop-blur-sm sm:px-6",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/80">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </section>
  )
}
