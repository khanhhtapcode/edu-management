import Image from "next/image"
import { APP_LOGO } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={APP_LOGO}
      alt="NY Math Class — Học Toán Thông Minh, Tư Duy Đột Phá"
      width={180}
      height={56}
      className={cn("h-9 w-auto object-contain", className)}
      priority={priority}
    />
  )
}
