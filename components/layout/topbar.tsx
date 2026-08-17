"use client"

import { useState, useTransition } from "react"
import { LogOut, Menu, Loader2, PanelLeftClose, PanelLeftOpen, ShieldCheck, Sparkles, Bell } from "lucide-react"
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-card/75 px-4 backdrop-blur-xl md:px-6 transition-all shadow-xs">
      {/* Desktop: sidebar toggle button */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        className="hidden md:flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40 transition-all duration-200 cursor-pointer"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4.5 text-primary" />
        ) : (
          <PanelLeftClose className="size-4.5" />
        )}
      </button>

      {/* Mobile menu trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden size-9 rounded-xl border border-border/50">
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-68 p-0 border-r border-border bg-sidebar/95 backdrop-blur-xl">
          <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <div className="flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-xs shadow-md shadow-indigo-500/20">
                NY
                <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-300 animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-extrabold text-sidebar-foreground tracking-tight">NY Math Class</span>
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Edu Management</span>
              </div>
            </div>
          </SheetHeader>
          <nav className="py-4 px-3 space-y-1.5">
            <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
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
                    "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/20"
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
      <div className="hidden md:block h-4.5 w-px bg-border/70 mx-0.5" />

      {/* Page Title & Breadcrumb */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <h1 className="truncate text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell Badge */}
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/50 transition-all duration-200 cursor-pointer"
          aria-label="Thông báo"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        </Button>

        {/* Dark mode toggle */}
        <ThemeToggle />

        <div className="h-4.5 w-px bg-border/70 mx-0.5" />

        {/* User Badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-gradient-to-r from-secondary/80 to-secondary/40 rounded-xl py-1 px-3 border border-border/60 shadow-2xs">
          <Avatar className="size-7 ring-2 ring-primary/30">
            <AvatarFallback className="bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-[10px] font-black">
              QT
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block leading-tight text-left">
            <p className="text-xs font-bold text-foreground flex items-center gap-1">
              Quản trị viên <ShieldCheck className="size-3 text-indigo-500" />
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold">Superadmin</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-9 px-3 rounded-xl font-semibold text-xs border border-transparent hover:border-destructive/20 transition-all"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin text-destructive" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}

