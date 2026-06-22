import { type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: "primary" | "success" | "info" | "warning"
}

const ACCENT: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  info: "bg-info/15 text-info",
  warning: "bg-warning/20 text-amber-600 dark:text-amber-400",
}

export function KpiCard({ title, value, icon: Icon, hint, accent = "primary" }: Props) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            ACCENT[accent]
          )}
        >
          <Icon className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
