"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"

/**
 * Legacy SSLCommerz return URL. Query params are never trusted for payment state —
 * we only route to clean /success or /failed pages.
 */
function LegacyResultRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const status = (searchParams.get("status") ?? "").toLowerCase()
    const success =
      status === "success" || status === "successful" || status === "completed"
    router.replace(success ? "/success" : "/failed")
  }, [router, searchParams])

  return <ProgressLoaderScreen label="Redirecting…" />
}

export default function CheckoutResultPage() {
  return (
    <React.Suspense fallback={<ProgressLoaderScreen label="Redirecting…" />}>
      <LegacyResultRedirect />
    </React.Suspense>
  )
}
