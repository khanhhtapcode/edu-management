"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV, isNavActive } from "@/lib/nav"
import { useSidebar } from "./sidebar-context"
import { ChevronRight } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 relative",
        "bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[60px]" : "w-60"
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-0" : "px-4 gap-2.5"
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
          NY
        </div>
        {!collapsed && (
          <span className="flex-1 text-sm font-semibold text-sidebar-foreground tracking-tight truncate">
            NY Math Class
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-hidden">
        {!collapsed && (
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Quản lý
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
                "group relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                active
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {/* Active indicator bar */}
              {active && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "shrink-0",
                  collapsed ? "size-[18px]" : "size-4",
                  active
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={toggle}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 transition-transform duration-300",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Thu nhỏ</span>}
        </button>
      </div>
    </aside>
  )
}
