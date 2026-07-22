"use client"

import { useState, useTransition } from "react"
import { LogOut, Menu, Loader2, PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { NAV, isNavActive } from "@/lib/nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "./sidebar-context"

export function Topbar() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  const current = NAV.find((n) => isNavActive(n.href, pathname))
  const title = current?.label ?? "Tổng quan"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-card/80 px-4 backdrop-blur-md md:px-6 transition-all">
      {/* Desktop: sidebar toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        className="hidden md:flex size-8.5 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 cursor-pointer"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4.5" />
        ) : (
          <PanelLeftClose className="size-4.5" />
        )}
      </button>

      {/* Mobile: hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden size-9">
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r border-border bg-sidebar">
          <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20">
                NY
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-sidebar-foreground">NY Math Class</span>
                <span className="text-[10px] text-muted-foreground">Edu Management</span>
              </div>
            </div>
          </SheetHeader>
          <nav className="py-4 px-3 space-y-1">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Quản lý hệ thống
            </p>
            {NAV.map((item) => {
              const active = isNavActive(item.href, pathname)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0",
                      active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Separator */}
      <div className="hidden md:block h-5 w-px bg-border/70" />

      {/* Page title */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <h1 className="truncate text-sm font-bold text-foreground tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <ThemeToggle />

        <div className="h-4 w-px bg-border/70 mx-1" />

        {/* User info */}
        <div className="hidden sm:flex items-center gap-2.5 bg-secondary/50 rounded-full py-1 px-3 border border-border/50">
          <Avatar className="size-7 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-[10px] font-bold">
              QT
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block leading-tight text-left">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              Quản trị viên <ShieldCheck className="size-3 text-indigo-500" />
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Superadmin</p>
          </div>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border/70 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-8.5 px-3 rounded-lg font-medium text-xs"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}
