"use client"

import { useState, useTransition } from "react"
import { LogOut, Menu, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/actions/auth"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Clock,
  ClipboardCheck,
  NotebookPen,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/students", label: "Học sinh", icon: Users },
  { href: "/shifts", label: "Ca học", icon: Clock },
  { href: "/attendance", label: "Điểm danh", icon: ClipboardCheck },
  { href: "/lessons", label: "Nhật ký bài học", icon: NotebookPen },
  { href: "/reports", label: "Báo cáo & PDF", icon: FileBarChart },
]

export function Topbar() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const current = NAV.find((n) =>
    n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
  )
  const title = current?.label ?? "EduTrack"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      {/* Mobile menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-16 justify-center border-b px-4">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <BrandLogo />
          </SheetHeader>
          <nav className="space-y-1 p-3">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary">
              QT
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Quản trị viên</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}
