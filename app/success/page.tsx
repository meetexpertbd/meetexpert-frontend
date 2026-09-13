"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { clearCheckoutSession, readCheckoutSession } from "@/lib/checkout"
import { fetchPayment } from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"

type ViewState = "loading" | "paid" | "pending" | "unpaid"

function isPaidStatus(status: string | null | undefined): boolean {
  const s = (status ?? "").toLowerCase()
  return s === "paid" || s === "completed" || s === "success" || s === "successful"
}

export default function SuccessPage() {
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const session = React.useMemo(() => readCheckoutSession(), [])
  const [view, setView] = React.useState<ViewState>("loading")
  const [bookingId, setBookingId] = React.useState<string | null>(session.bookingId)
  const [trxId, setTrxId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isHydrated) return

    let cancelled = false
    const paymentId = session.paymentId

    async function verify() {
      // No session / not logged in: never claim paid from URL alone.
      if (!token || !paymentId) {
        if (!cancelled) setView(session.paymentId || session.bookingId ? "pending" : "pending")
        return
      }

      const attempts = 6
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await fetchPayment(token, paymentId)
          const payment = res.data?.payment
          const booking = res.data?.booking
          if (cancelled) return

          if (booking?.id) setBookingId(String(booking.id))
          if (payment?.provider_trx_id) setTrxId(payment.provider_trx_id)

          if (isPaidStatus(payment?.status) || isPaidStatus(booking?.status)) {
            setView("paid")
            clearCheckoutSession()
            return
          }

          if (i < attempts - 1) {
            setView("pending")
            await new Promise((r) => setTimeout(r, 1500))
          }
        } catch {
          if (cancelled) return
          if (i < attempts - 1) {
            await new Promise((r) => setTimeout(r, 1500))
          }
        }
      }

      if (!cancelled) {
        setView("unpaid")
        clearCheckoutSession()
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [isHydrated, token, session.paymentId, session.bookingId])

  if (!isHydrated || view === "loading") {
    return <ProgressLoaderScreen label="Confirming payment…" />
  }

  if (view === "pending") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ProgressLoader size="lg" className="mx-auto" />
        <h1 className="mt-4 text-2xl font-bold">Confirming your payment…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait a moment while we verify your SSLCommerz payment with our server.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/dashboard/bookings">Check My Bookings</Link>
        </Button>
      </div>
    )
  }

  if (view === "unpaid") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <Clock3 className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Payment still confirming</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not confirm a paid booking yet. If money was deducted, it usually updates
          within a minute — check My Bookings shortly.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/bookings">My bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/failed">Payment help</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
        <CheckCircle2 className="size-7" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Payment successful</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your booking is confirmed. You can view it in My Bookings.
      </p>
      {(bookingId || trxId) && (
        <div className="mt-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-left text-sm">
          {bookingId && (
            <p>
              <span className="text-muted-foreground">Booking ID:</span>{" "}
              <span className="font-medium text-foreground">#{bookingId}</span>
            </p>
          )}
          {trxId && (
            <p className="mt-1">
              <span className="text-muted-foreground">Transaction ID:</span>{" "}
              <span className="font-medium text-foreground">{trxId}</span>
            </p>
          )}
        </div>
      )}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/dashboard/bookings">My bookings</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/experts">Find more experts</Link>
        </Button>
      </div>
    </div>
  )
}
