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
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card/85 px-5 py-4 shadow-xs backdrop-blur-xl sm:px-6 transition-all",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-14 size-36 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">{title}</h2>
            <p className="text-xs font-medium text-muted-foreground leading-snug mt-0.5">
              {description}
            </p>
          </div>
        </div>
        {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
      </div>
    </section>
  )
}
