"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV, isNavActive } from "@/lib/nav"
import { useSidebar } from "./sidebar-context"
import { ChevronRight, Sparkles } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 relative z-20",
        "bg-sidebar border-r border-sidebar-border/80 backdrop-blur-md",
        "transition-[width] duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[64px]" : "w-60"
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border/80 shrink-0",
          collapsed ? "justify-center px-0" : "px-4 gap-3"
        )}
      >
        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
          NY
          <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-300 animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight truncate leading-tight">
              NY Math Class
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/80 tracking-wide uppercase">
              Edu Management
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            Quản lý hệ thống
          </p>
        )}
        {NAV.map((item) => {
          const active = isNavActive(item.href, pathname)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-gradient-to-r from-primary/15 via-primary/10 to-transparent text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-0.5"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm shadow-primary/50",
                    collapsed
                      ? "left-1 h-5 w-1"
                      : "left-0 h-5 w-1"
                  )}
                />
              )}
              <Icon
                className={cn(
                  "shrink-0 transition-transform duration-200 group-hover:scale-110",
                  collapsed ? "size-5" : "size-4.5",
                  active
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border/80 p-2.5">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform duration-300",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Thu nhỏ thanh điều hướng</span>}
        </button>
      </div>
    </aside>
  )
}
