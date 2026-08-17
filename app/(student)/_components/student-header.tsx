"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"

import { logout } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { STUDENT_NAV } from "@/lib/nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function StudentHeader({
  fullName,
  className,
}: {
  fullName: string
  className: string
}) {
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/85 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 md:px-6">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
          NY
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-extrabold text-foreground tracking-tight">{fullName}</p>
          <p className="truncate text-[11px] font-bold text-primary tracking-wide uppercase mt-0.5">
            Lớp {className}
          </p>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl font-semibold text-xs h-9 px-3 cursor-pointer transition-all"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin text-destructive" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden text-xs font-bold sm:inline">Đăng xuất</span>
        </Button>
      </div>

      <nav className="mx-auto flex max-w-3xl gap-2 px-4 md:px-6 border-t border-border/40 py-1.5">
        {STUDENT_NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                active
                  ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
