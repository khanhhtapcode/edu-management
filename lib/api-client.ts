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

  // FormData (upload file): để trình duyệt tự set Content-Type + boundary, không stringify.
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData

  const res = await fetch(url, {
    method,
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: isFormData
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
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
