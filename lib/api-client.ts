const DEFAULT_API_BASE = "http://127.0.0.1:8000/api/v1"

export function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_API_BASE
  return raw.replace(/\/$/, "")
}

export function getAssetBaseUrl() {
  const api = getApiBaseUrl()
  return api.replace(/\/api\/v1$/i, "") || "http://127.0.0.1:8000"
}

const getBaseUrl = () => getApiBaseUrl()

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  token?: string | null
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return undefined as T
  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const msg = (body as { message?: unknown }).message
    if (typeof msg === "string" && msg.trim()) return msg
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit & { token?: string | null }): Promise<T> {
  const { token, ...fetchInit } = init
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`
  const headers = new Headers(fetchInit.headers)

  if (
    fetchInit.body &&
    !(fetchInit.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(url, { ...fetchInit, headers })

  if (!res.ok) {
    let body: unknown
    try {
      body = await parseResponse(res.clone())
    } catch {
      body = undefined
    }
    throw new ApiError(
      messageFromBody(body, res.statusText || `HTTP ${res.status}`),
      res.status,
      body
    )
  }

  return parseResponse<T>(res)
}

function jsonBody(body?: unknown): BodyInit | undefined {
  if (body === undefined) return undefined
  return JSON.stringify(body)
}

export function get<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>(path, { ...options, method: "GET" })
}

export function post<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions
) {
  return request<T>(path, { ...options, method: "POST", body: jsonBody(body) })
}

export function postForm<T = unknown>(
  path: string,
  body: FormData,
  options?: RequestOptions
) {
  return request<T>(path, { ...options, method: "POST", body })
}

export function put<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions
) {
  return request<T>(path, { ...options, method: "PUT", body: jsonBody(body) })
}

export function patch<T = unknown>(
  path: string,
  body?: unknown,
  options?: RequestOptions
) {
  return request<T>(path, { ...options, method: "PATCH", body: jsonBody(body) })
}

export function del<T = unknown>(path: string, options?: RequestOptions) {
  return request<T>(path, { ...options, method: "DELETE" })
}
