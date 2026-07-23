import { BookOpen, CheckCircle2, Sparkles } from "lucide-react"
import { LoginForm } from "./_components/login-form"

export const metadata = { title: "Đăng nhập — NY MATH CLASS" }

const FEATURES = [
  "Điểm danh học sinh theo từng buổi học",
  "Ghi nhận nhận xét và tiến độ cá nhân",
  "Xuất báo cáo PDF gửi phụ huynh",
  "Thống kê chuyên cần trực quan",
]

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: form */}
      <div className="relative flex flex-col bg-background">
        {/* Top brand */}
        <div className="flex h-16 items-center border-b border-border px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-sm font-extrabold text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
              NY
              <Sparkles className="absolute -right-1 -top-1 size-3 text-amber-400" />
            </div>
            <div className="leading-tight">
              <p className="font-bold tracking-tight text-foreground">NY Math Class</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Edu Management</p>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-8 py-12">
          <div className="w-full max-w-[380px] rounded-2xl border border-border/70 bg-card/70 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm sm:p-8">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                <Sparkles className="size-3" />
                Cổng quản trị lớp học
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Đăng nhập hệ thống
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Nhập tài khoản quản trị để truy cập bảng điều khiển.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <div className="flex h-12 items-center border-t border-border px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NY MATH CLASS &nbsp;&middot;&nbsp; Học Toán Thông Minh
          </p>
        </div>
      </div>

      {/* Right: hero panel */}
      <div className="relative hidden lg:flex flex-col overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700">
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Glow accent */}
        <div className="absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[-5%] h-56 w-56 rounded-full bg-white/8 blur-3xl" />

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-between p-12">
          {/* Top icon */}
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/15 backdrop-blur-sm shadow-lg shadow-indigo-950/20">
            <BookOpen className="size-6 text-white" />
          </div>

          {/* Main copy */}
          <div>
            <h2 className="text-3xl font-bold leading-snug text-white text-balance">
              Quản lý lớp học hiện đại, gọn nhẹ và trực quan.
            </h2>
            <p className="mt-4 text-base text-white/70 leading-relaxed max-w-sm">
              Tất cả công cụ bạn cần để vận hành trung tâm toán học hiệu quả mỗi ngày.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/85">
                  <CheckCircle2 className="size-4 shrink-0 text-white/60" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
            {[
              { value: "100%", label: "Miễn phí dữ liệu" },
              { value: "< 1s", label: "Tốc độ tải trang" },
              { value: "PDF", label: "Xuất báo cáo nhanh" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
