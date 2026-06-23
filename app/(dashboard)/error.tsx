"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message ||
            "Không thể tải dữ liệu. Kiểm tra kết nối database và thử lại."}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            Mã lỗi: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={() => reset()}>Thử lại</Button>
    </div>
  )
}
