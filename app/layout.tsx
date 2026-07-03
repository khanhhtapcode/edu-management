import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { APP_LOGO } from "@/lib/constants"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
})

export const metadata: Metadata = {
  title: "NY MATH CLASS — Quản lý lớp học & học sinh",
  description:
    "Hệ thống quản lý lớp học, học sinh, điểm danh và báo cáo cho trung tâm giáo dục.",
  icons: {
    icon: APP_LOGO,
    apple: APP_LOGO,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
