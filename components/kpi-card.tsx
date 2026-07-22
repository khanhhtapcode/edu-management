import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: "primary" | "success" | "info" | "warning"
}

const ACCENT_STYLES: Record<
  string,
  { icon: string; dot: string; glow: string; border: string }
> = {
  primary: {
    icon: "from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    dot: "bg-indigo-500 shadow-sm shadow-indigo-500/50",
    glow: "group-hover:from-indigo-500/10 group-hover:to-purple-500/5",
    border: "hover:border-indigo-500/40",
  },
  success: {
    icon: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-500 shadow-sm shadow-emerald-500/50",
    glow: "group-hover:from-emerald-500/10 group-hover:to-teal-500/5",
    border: "hover:border-emerald-500/40",
  },
  info: {
    icon: "from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30",
    dot: "bg-sky-500 shadow-sm shadow-sky-500/50",
    glow: "group-hover:from-sky-500/10 group-hover:to-blue-500/5",
    border: "hover:border-sky-500/40",
  },
  warning: {
    icon: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dot: "bg-amber-500 shadow-sm shadow-amber-500/50",
    glow: "group-hover:from-amber-500/10 group-hover:to-orange-500/5",
    border: "hover:border-amber-500/40",
  },
}

export function KpiCard({ title, value, icon: Icon, hint, accent = "primary" }: Props) {
  const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.primary

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/70",
        "bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md p-5",
        "shadow-sm transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10",
        styles.border
      )}
    >
      {/* Background Gradient Glow on Hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.glow
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </p>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
            styles.icon
          )}
        >
          <Icon className="size-5 transition-transform duration-300 group-hover:rotate-6" />
        </div>
      </div>

      <div className="relative z-10 mt-3">
        <p className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {hint && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full shrink-0 animate-pulse", styles.dot)} />
            <p className="text-xs font-medium text-muted-foreground/90 truncate">{hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
