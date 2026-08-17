import { BookOpen, CheckCircle2, Sparkles } from "lucide-react"
import { LoginForm } from "./_components/login-form"

export const metadata = { title: "Đăng nhập — NY MATH CLASS" }

const FEATURES = [
  "Điểm danh học sinh theo từng buổi học trực quan",
  "Ghi nhận nhận xét, tiến độ & thu học phí đợt mới",
  "Xuất báo cáo PDF kết quả gửi phụ huynh",
  "Thống kê chuyên cần trực quan với biểu đồ OKLCH",
]

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col justify-between p-6 md:p-10">
        {/* Top brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            NY
            <Sparkles className="absolute -top-1 -right-1 size-3 text-amber-300 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-foreground tracking-tight text-base leading-none">NY Math Class</span>
            <span className="text-[10px] font-bold text-primary tracking-wider uppercase mt-0.5">Edu Management Platform</span>
          </div>
        </div>

        {/* Form area */}
        <div className="my-auto py-12 flex justify-center">
          <div className="w-full max-w-[380px] space-y-6">
            <div className="space-y-2 text-left">
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Đăng nhập hệ thống 👋
              </h1>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                Nhập tài khoản quản trị để truy cập bảng điều khiển và quản lý lớp học.
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-sm">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-left">
          <p className="text-xs font-semibold text-muted-foreground/80">
            &copy; {new Date().getFullYear()} NY MATH CLASS &nbsp;&middot;&nbsp; Học Toán Thông Minh v2.0
          </p>
        </div>
      </div>

      {/* Right: hero panel */}
      <div className="relative hidden lg:flex flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-12 justify-between">
        {/* Decorative ambient mesh glows */}
        <div className="pointer-events-none absolute top-10 right-10 size-96 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-96 rounded-full bg-gradient-to-tr from-violet-600/30 to-cyan-500/20 blur-3xl" />

        {/* Top header badge */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-md">
            <BookOpen className="size-5 text-white" />
          </div>
          <span className="text-xs font-extrabold tracking-widest text-indigo-300 uppercase">Executive Dashboard</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <h2 className="text-4xl font-black leading-tight text-white tracking-tight">
            Quản lý lớp học hiện đại, <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
              tối ưu và thông minh.
            </span>
          </h2>
          <p className="text-sm font-medium text-indigo-100/70 leading-relaxed">
            Hệ thống quản lý giáo dục toàn diện giúp tối ưu công tác điểm danh, thống kê báo cáo và theo dõi học sinh chuẩn mực.
          </p>

          <ul className="space-y-3.5 pt-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-xs font-semibold text-white/90">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="size-3.5" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {[
            { value: "100%", label: "Chính xác điểm danh" },
            { value: "< 1s", label: "Tốc độ phản hồi" },
            { value: "PDF", label: "Xuất báo cáo nhanh" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/5 backdrop-blur-md p-3 border border-white/10">
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="mt-0.5 text-[10px] font-bold text-indigo-200/70 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
