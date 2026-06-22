type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Client helper: tự serialize JSON, ném Error(message) khi response không OK.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json")
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    const message =
      (payload && (payload.message as string)) ||
      "Có lỗi xảy ra, vui lòng thử lại"
    throw new Error(message)
  }

  return payload as T
}
