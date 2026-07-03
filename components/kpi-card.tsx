import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: "primary" | "success" | "info" | "warning"
}

const ACCENT_ICON: Record<string, string> = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
}

const ACCENT_DOT: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
}

export function KpiCard({ title, value, icon: Icon, hint, accent = "primary" }: Props) {
  return (
    <div className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-sm hover:border-border/80">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground leading-snug">{title}</p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            ACCENT_ICON[accent]
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold tracking-tight text-card-foreground tabular-nums">
          {value}
        </p>
        {hint && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full shrink-0", ACCENT_DOT[accent])} />
            <p className="text-xs text-muted-foreground truncate">{hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
