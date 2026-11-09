import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
  title: "MathClass — Quản lý lớp học & học sinh",
  description:
    "Hệ thống quản lý lớp học, học sinh, điểm danh và báo cáo cho trung tâm giáo dục.",
  // Favicon: app/icon.svg (Next.js tự nhận diện)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
