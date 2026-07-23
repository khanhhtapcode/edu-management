import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider } from "@/components/layout/sidebar-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-svh overflow-x-clip bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--primary)_10%,transparent),transparent_68%)]"
        />
        <Sidebar />
        <div className="relative z-10 flex min-w-10 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-7">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
