import {
  LayoutDashboard,
  Users,
  Clock,
  ClipboardCheck,
  NotebookPen,
  FileBarChart,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { href: string; label: string; icon: LucideIcon }

/** Mục điều hướng dùng chung cho sidebar (desktop) và topbar (mobile). */
export const NAV: NavItem[] = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/students", label: "Học sinh", icon: Users },
  { href: "/shifts", label: "Ca học", icon: Clock },
  { href: "/attendance", label: "Điểm danh", icon: ClipboardCheck },
  { href: "/lessons", label: "Nhật ký bài học", icon: NotebookPen },
  { href: "/reports", label: "Báo cáo & PDF", icon: FileBarChart },
]

/** Xác định mục đang active theo pathname hiện tại. */
export function isNavActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
