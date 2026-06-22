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
          "flex h-16 items-center border-b border-slate-100 shrink-0 gap-2",
          collapsed ? "justify-center px-2" : "px-3"
        )}
      >
        {collapsed ? (
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm">
            NY
          </div>
        ) : (
          <>
            <BrandLogo className="h-9 w-auto flex-1 min-w-0" priority />
            <button
              onClick={toggle}
              aria-label="Thu nhỏ sidebar"
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
        {/* Expand button (collapsed mode only) */}
        {collapsed && (
          <button
            onClick={toggle}
            aria-label="Mở rộng sidebar"
            className="flex w-full items-center justify-center py-2 mb-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
          >
            <ChevronLeft className="size-4 rotate-180" />
          </button>
        )}
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

    </aside>
  )
}
