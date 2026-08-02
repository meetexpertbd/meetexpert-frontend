"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { get } from "@/lib/api-client"

type UseGetOptions<T> = {
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError"
}

export function useGet<T = unknown>(
  url: string | null,
  options: UseGetOptions<T> = {}
): {
  data: T | null
  error: Error | null
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<void>
} {
  const { enabled = true, onSuccess, onError } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(url && enabled))

  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  })

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!url) {
      setData(null)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await get<T>(url, { signal })
      if (signal?.aborted) return
      setData(result)
      onSuccessRef.current?.(result)
    } catch (e) {
      if (isAbortError(e) || signal?.aborted) return
      const err = toError(e)
      setError(err)
      setData(null)
      onErrorRef.current?.(err)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (!url || !enabled) {
      if (!url) {
        setData(null)
        setError(null)
      }
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [url, enabled, fetchData])

  const refetch = useCallback(() => fetchData(), [fetchData])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    refetch,
  }
}
