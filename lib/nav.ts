import {
  LayoutDashboard,
  Users,
  CalendarRange,
  NotebookPen,
  FileBarChart,
  FileText,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { href: string; label: string; icon: LucideIcon }

/** Mục điều hướng dùng chung cho sidebar (desktop) và topbar (mobile). */
export const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Học sinh", icon: Users },
  { href: "/schedule", label: "Thời khóa biểu", icon: CalendarRange },
  { href: "/lessons", label: "Nhật ký bài học", icon: NotebookPen },
  { href: "/assignments", label: "Bài tập", icon: FileText },
  { href: "/reports", label: "Báo cáo & PDF", icon: FileBarChart },
]

/** Mục điều hướng cho khu vực học sinh. */
export const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Bài tập về nhà", icon: FileText },
  { href: "/student/profile", label: "Thông tin học tập", icon: GraduationCap },
]

/** Xác định mục đang active theo pathname hiện tại. */
export function isNavActive(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
