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
import { useSidebar } from "./sidebar-context"

export function Topbar() {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  const current = NAV.find((n) => isNavActive(n.href, pathname))
  const title = current?.label ?? "Tổng quan"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm md:px-5">
      {/* Desktop: sidebar toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Mở sidebar" : "Đóng sidebar"}
        className="hidden md:flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150 cursor-pointer"
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
          <Button variant="outline" size="icon" className="md:hidden border-slate-200">
            <Menu className="size-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r border-slate-200">
          <SheetHeader className="h-16 justify-center border-b border-slate-100 px-4">
            <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
            <BrandLogo priority />
          </SheetHeader>
          <nav className="py-3 px-2 space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
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
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Separator + Page title */}
      <div className="hidden md:block h-5 w-px bg-slate-200" />
      <h1 className="flex-1 truncate text-sm font-semibold text-slate-800 md:text-base">
        {title}
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2.5 sm:flex">
          <Avatar className="size-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              QT
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block leading-tight">
            <p className="text-sm font-medium text-slate-800">Quản trị viên</p>
            <p className="text-[11px] text-slate-400">Superadmin</p>
          </div>
        </div>

        <div className="hidden sm:block h-5 w-px bg-slate-200" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => startTransition(() => logout())}
          disabled={isPending}
          className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span className="hidden sm:inline text-sm">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}
