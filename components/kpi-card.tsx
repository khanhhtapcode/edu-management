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
  { icon: string; dot: string; glow: string; border: string; bgRadial: string }
> = {
  primary: {
    icon: "from-indigo-500/25 to-purple-500/25 text-indigo-600 dark:text-indigo-400 border-indigo-500/40 shadow-indigo-500/20",
    dot: "bg-indigo-500 shadow-sm shadow-indigo-500/60",
    glow: "group-hover:from-indigo-500/15 group-hover:to-purple-500/10",
    border: "hover:border-indigo-500/50",
    bgRadial: "from-indigo-500/10 to-transparent",
  },
  success: {
    icon: "from-emerald-500/25 to-teal-500/25 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-emerald-500/20",
    dot: "bg-emerald-500 shadow-sm shadow-emerald-500/60",
    glow: "group-hover:from-emerald-500/15 group-hover:to-teal-500/10",
    border: "hover:border-emerald-500/50",
    bgRadial: "from-emerald-500/10 to-transparent",
  },
  info: {
    icon: "from-sky-500/25 to-blue-500/25 text-sky-600 dark:text-sky-400 border-sky-500/40 shadow-sky-500/20",
    dot: "bg-sky-500 shadow-sm shadow-sky-500/60",
    glow: "group-hover:from-sky-500/15 group-hover:to-blue-500/10",
    border: "hover:border-sky-500/50",
    bgRadial: "from-sky-500/10 to-transparent",
  },
  warning: {
    icon: "from-amber-500/25 to-orange-500/25 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-amber-500/20",
    dot: "bg-amber-500 shadow-sm shadow-amber-500/60",
    glow: "group-hover:from-amber-500/15 group-hover:to-orange-500/10",
    border: "hover:border-amber-500/50",
    bgRadial: "from-amber-500/10 to-transparent",
  },
}

export function KpiCard({ title, value, icon: Icon, hint, accent = "primary" }: Props) {
  const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.primary

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70",
        "bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl p-5.5",
        "shadow-xs transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10",
        styles.border
      )}
    >
      {/* Background Radial Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gradient-to-br blur-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-100",
          styles.bgRadial
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </p>
        <div
          className={cn(
            "flex size-10.5 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            styles.icon
          )}
        >
          <Icon className="size-5 transition-transform duration-300" />
        </div>
      </div>

      <div className="relative z-10 mt-3.5">
        <p className="text-3xl font-black tracking-tight text-foreground tabular-nums">
          {value}
        </p>
        {hint && (
          <div className="mt-2.5 flex items-center gap-2">
            <span className={cn("size-2 rounded-full shrink-0 animate-pulse", styles.dot)} />
            <p className="text-xs font-semibold text-muted-foreground/90 truncate">{hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

