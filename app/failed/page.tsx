"use client"

import * as React from "react"
import Link from "next/link"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clearCheckoutSession, readCheckoutSession } from "@/lib/checkout"

export default function FailedPage() {
  const session = React.useMemo(() => readCheckoutSession(), [])
  const expertSlug = session.expertSlug

  React.useEffect(() => {
    clearCheckoutSession()
  }, [])

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/15 text-red-600">
        <XCircle className="size-7" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Payment failed</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your payment was cancelled or could not be completed. No booking was confirmed.
        You can try again from the expert profile.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {expertSlug ? (
          <Button asChild>
            <Link href={`/experts/${expertSlug}`}>Retry booking</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/experts">Find an expert</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/dashboard/bookings">View bookings</Link>
        </Button>
      </div>
    </div>
  )
}
