import { APP_LOGO } from "@/lib/constants"

let cachedDataUrl: string | null = null

/**
 * Đọc logo mặc định dạng PNG data URL (dùng cho PDF client-side).
 * Logo gốc là SVG nhưng @react-pdf/renderer không hỗ trợ SVG trong <Image>,
 * nên rasterize qua canvas (độ phân giải x4 để in sắc nét).
 */
export async function getAppLogoDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl

  const img = new window.Image()
  img.decoding = "async"
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("Không tải được logo"))
    img.src = APP_LOGO
  })

  const scale = 4
  const width = img.naturalWidth || 256
  const height = img.naturalHeight || 72
  const canvas = document.createElement("canvas")
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Không đọc được logo")
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  cachedDataUrl = canvas.toDataURL("image/png")
  return cachedDataUrl
}
