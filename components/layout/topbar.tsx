"use client"

import { useState, useTransition } from "react"
import { LogOut, Menu, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react"
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-sm md:px-4">
      {/* Desktop: sidebar toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        className="hidden md:flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150 cursor-pointer"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>

      {/* Mobile: hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden size-8">
            <Menu className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 border-r border-border bg-sidebar">
          <SheetHeader className="h-14 justify-center border-b border-sidebar-border px-4">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                NY
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">NY Math Class</span>
            </div>
          </SheetHeader>
          <nav className="py-4 px-2 space-y-0.5">
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Quản lý
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
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
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
      <div className="hidden md:block h-4 w-px bg-border" />

      {/* Page title */}
      <h1 className="flex-1 truncate text-sm font-semibold text-foreground">
        {title}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <ThemeToggle />

        <div className="h-4 w-px bg-border mx-1" />

        {/* User info */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              QT
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block leading-tight">
            <p className="text-xs font-medium text-foreground">Quản trị viên</p>
            <p className="text-[10px] text-muted-foreground">Superadmin</p>
          </div>
        </div>

        <div className="hidden sm:block h-4 w-px bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-8 px-2.5"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <LogOut className="size-3.5" />
          )}
          <span className="hidden sm:inline text-xs font-medium">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}
