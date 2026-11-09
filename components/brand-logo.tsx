import { cn } from "@/lib/utils"

/** Biểu tượng MathClass (chữ π trên nền gradient). Đồng bộ với app/icon.svg & public/logo.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-[25%] bg-linear-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25",
        className
      )}
    >
      <svg viewBox="0 0 64 64" className="size-full">
        <g
          fill="none"
          stroke="#fff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 24 C19 20 23 21 27 21 H48" />
          <path d="M26 21 V47" />
          <path d="M39 21 V40 C39 45 42 47 46 46" />
        </g>
        <circle cx="51" cy="13" r="4.5" fill="#fbbf24" />
      </svg>
    </span>
  )
}

/** Logo đầy đủ: biểu tượng + chữ "MathClass". */
export function BrandLogo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="text-base font-bold tracking-tight">
        <span className="text-foreground">Math</span>
        <span className="text-primary">Class</span>
      </span>
    </span>
  )
}
