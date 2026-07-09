"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
      <h2 className="text-sm font-semibold text-foreground">Đã có lỗi xảy ra</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message || "Vui lòng thử lại."}
      </p>
      <Button className="mt-4" onClick={() => reset()}>
        Thử lại
      </Button>
    </div>
  )
}
