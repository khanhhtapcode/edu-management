"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV, isNavActive } from "@/lib/nav"
import { BrandLogo } from "@/components/brand-logo"
import { useSidebar } from "./sidebar-context"
import { ChevronLeft } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 relative",
        "bg-white border-r border-slate-200 shadow-sm",
        "transition-[width] duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-slate-100 shrink-0 relative",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {collapsed ? (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            NY
          </div>
        ) : (
          <BrandLogo className="h-9 w-auto" priority />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
        {/* Section label */}
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
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
                "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                collapsed ? "justify-center px-0 py-2.5 mx-0" : "px-3 py-2.5",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  collapsed ? "size-5" : "size-4",
                  active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-700"
                )}
              />
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {active && !collapsed && (
                <span className="size-1.5 rounded-full bg-primary-foreground/70 shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-slate-100 transition-all duration-300",
          collapsed ? "p-2" : "p-4"
        )}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <div className="size-1.5 rounded-full bg-slate-300" />
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-slate-500">NY Math Class</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Học Toán Thông Minh · v1.0</p>
          </div>
        )}
      </div>

      {/* Collapse toggle button — floats on the right edge */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        className={cn(
          "absolute -right-3 top-[4.5rem] z-20",
          "flex size-6 items-center justify-center rounded-full",
          "border border-slate-200 bg-white shadow-md",
          "text-slate-400 hover:text-slate-700 hover:border-slate-300",
          "transition-colors duration-150 cursor-pointer"
        )}
      >
        <ChevronLeft
          className={cn(
            "size-3.5 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  )
}
