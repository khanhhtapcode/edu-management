import { APP_LOGO } from "@/lib/constants"

let cachedDataUrl: string | null = null

/** Đọc logo mặc định dạng data URL (dùng cho PDF client-side). */
export async function getAppLogoDataUrl(): Promise<string> {
  if (cachedDataUrl) return cachedDataUrl
  const res = await fetch(APP_LOGO)
  if (!res.ok) throw new Error("Không tải được logo")
  const blob = await res.blob()
  cachedDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Không đọc được logo"))
    reader.readAsDataURL(blob)
  })
  return cachedDataUrl
}
