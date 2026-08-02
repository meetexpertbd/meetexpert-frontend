"use client"

import { useState, useCallback, useRef, useEffect } from "react"

type UseMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
}

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e))
}

export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
) {
  const { onSuccess, onError } = options
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutationFnRef = useRef(mutationFn)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    mutationFnRef.current = mutationFn
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  })

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFnRef.current(variables)
      setData(result)
      onSuccessRef.current?.(result, variables)
      return result
    } catch (e) {
      const err = toError(e)
      setError(err)
      onErrorRef.current?.(err, variables)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    mutate,
    reset,
  }
}
