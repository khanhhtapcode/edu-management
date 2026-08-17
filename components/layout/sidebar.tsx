"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV, isNavActive } from "@/lib/nav"
import { useSidebar } from "./sidebar-context"
import { ChevronRight, Sparkles, Command } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 relative z-20 select-none",
        "bg-sidebar/95 border-r border-sidebar-border/80 backdrop-blur-xl",
        "transition-[width] duration-300 ease-in-out overflow-hidden shadow-sm",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border/60 shrink-0 transition-all",
          collapsed ? "justify-center px-0" : "px-4.5 gap-3"
        )}
      >
        <div className="relative flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
          NY
          <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-300 animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold tracking-tight text-sidebar-foreground truncate leading-tight flex items-center gap-1">
              NY Math Class
            </span>
            <span className="text-[10px] font-bold text-primary tracking-wider uppercase mt-0.5">
              Edu Management v2.0
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-2.5 pb-2 flex items-center justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
              Quản lý hệ thống
            </p>
          </div>
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
                "group relative flex items-center gap-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer",
                collapsed ? "justify-center px-0 py-2.5" : "px-3.5 py-2.5",
                active
                  ? "bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {/* Active indicator pill */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary"
                />
              )}
              <Icon
                className={cn(
                  "shrink-0 transition-transform duration-150 group-hover:scale-105",
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

      {/* Collapse toggle footer */}
      <div className="border-t border-sidebar-border/60 p-3">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150 cursor-pointer border border-transparent hover:border-border/50",
            collapsed && "justify-center px-0"
          )}
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 transition-transform duration-300 text-primary",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="truncate">Thu nhỏ menu</span>}
        </button>
      </div>
    </aside>
  )
}

