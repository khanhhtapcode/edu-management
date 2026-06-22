import { BrandLogo } from "@/components/brand-logo"
import { LoginForm } from "./_components/login-form"

export const metadata = { title: "Đăng nhập — NY MATH CLASS" }

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Cột trái: form */}
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center">
          <BrandLogo priority />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-6 flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Đăng nhập hệ thống
              </h1>
              <p className="text-sm text-muted-foreground">
                Nhập tài khoản quản trị để truy cập bảng điều khiển.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Cột phải: hero */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          {/* Logo text-based vì JPG không hỗ trợ transparency trên nền màu */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 font-bold text-white text-lg shadow-sm">
              NY
            </div>
            <div>
              <p className="font-bold text-white text-base leading-tight">NY Math Class</p>
              <p className="text-white/60 text-xs">Học Toán Thông Minh · Tư Duy Đột Phá</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Quản lý lớp học hiện đại, gọn nhẹ và trực quan.
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Theo dõi chuyên cần, ghi nhận nhận xét và xuất phiếu báo cáo
              tháng cho phụ huynh — tất cả trong một nơi.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} NY MATH CLASS
          </p>
        </div>
      </div>
    </div>
  )
}
