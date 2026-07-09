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
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          NY
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Lớp {className}
          </p>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden text-xs font-medium sm:inline">Đăng xuất</span>
        </Button>
      </div>

      <nav className="mx-auto flex max-w-3xl gap-1 px-4">
        {STUDENT_NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
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
