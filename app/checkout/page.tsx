"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle2, Clock, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import { createBooking } from "@/lib/expert-api"
import { PLACEHOLDER_AVATAR } from "@/lib/experts-data"
import {
  PAYMENT_METHODS,
  checkoutDraftFromSearch,
  checkoutFees,
  formatBdt,
  type PaymentMethod,
} from "@/lib/checkout"
import { PaymentMethodIcon } from "@/components/payment-icons"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

function formatTime(value: string): string {
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  let h = Number(m[1])
  const min = m[2]
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${min} ${ampm}`
}

function formatDate(value: string): string {
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function CheckoutPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const draft = React.useMemo(
    () => checkoutDraftFromSearch(searchParams),
    [searchParams]
  )

  const [method, setMethod] = React.useState<PaymentMethod>("bkash")
  const [paying, setPaying] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)
  const [imgFailed, setImgFailed] = React.useState(false)

  const checkoutPath = React.useMemo(() => {
    const q = searchParams.toString()
    return q ? `/checkout?${q}` : "/checkout"
  }, [searchParams])

  React.useEffect(() => {
    if (!isHydrated) return
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(checkoutPath)}`)
    }
  }, [isHydrated, token, router, checkoutPath])

  async function handlePay() {
    if (!draft || !token) return
    setError(null)
    setPaying(true)
    try {
      await createBooking(token, {
        expert_id: draft.expertId,
        availability_slot_id: draft.availabilitySlotId,
        date: draft.date,
      })
      setDone(true)
    } catch (e) {
      let message = "Payment could not be completed."
      if (e instanceof ApiError) {
        const body = e.body
        if (body && typeof body === "object" && "errors" in body) {
          const errors = (body as { errors?: Record<string, string[] | string> }).errors
          const first = errors
            ? Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [v]))[0]
            : null
          message = first || e.message
        } else {
          message = e.message
        }
      } else if (e instanceof Error) {
        message = e.message
      }
      setError(message)
    } finally {
      setPaying(false)
    }
  }

  if (!isHydrated || !token) {
    return <ProgressLoaderScreen label="Loading checkout…" />
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-medium text-foreground">This checkout session is incomplete.</p>
        <p className="mt-1 text-sm text-muted-foreground">Pick a slot again to continue.</p>
        <Button className="mt-6" asChild>
          <Link href="/experts">Find an expert</Link>
        </Button>
      </div>
    )
  }

  const image = !imgFailed && draft.expertImage ? draft.expertImage : PLACEHOLDER_AVATAR
  const selected = PAYMENT_METHODS.find((m) => m.id === method)
  const fees = draft.amount != null ? checkoutFees(draft.amount) : null

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Booking confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paid with {selected?.name}. Your session with {draft.expertName} is on{" "}
          {formatDate(draft.date)} at {formatTime(draft.start)}.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/bookings">View bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/experts/${draft.expertSlug}`}>Back to profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/experts/${draft.expertSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to expert
      </Link>

      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review your session and choose a payment method.
      </p>

      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">        

        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="space-y-4 p-6">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={draft.expertName}
                className="size-14 rounded-lg object-cover"
                onError={() => setImgFailed(true)}
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{draft.expertName}</p>
                {draft.headline && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{draft.headline}</p>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Calendar className="size-4" />
                {formatDate(draft.date)}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4" />
                {formatTime(draft.start)} – {formatTime(draft.end)}
                {draft.duration ? ` · ${draft.duration}` : ""}
              </p>
            </div>
            {fees ? (
              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatBdt(fees.subtotal)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">Platform fee (15%)</span>
                  <span className="text-foreground">{formatBdt(fees.platformFee)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">VAT / tax (5%)</span>
                  <span className="text-foreground">{formatBdt(fees.vat)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatBdt(fees.total)}
                  </span>
                </div>
              </div>
            ) : draft.price ? (
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">{draft.price}</span>
              </div>
            ) : null}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Secure checkout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Payment method</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Select how you want to pay.</p>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map((item) => {
                  const checked = method === item.id
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                        checked ? item.accent : "border-border bg-card hover:bg-muted/30"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={item.id}
                        checked={checked}
                        onChange={() => setMethod(item.id)}
                        className="size-4 accent-primary"
                      />
                      <PaymentMethodIcon id={item.id} className="size-11 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">{item.name}</span>
                        <span className="block text-sm text-muted-foreground">{item.hint}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="button"
              size="lg"
              className="w-full gap-2"
              disabled={paying}
              onClick={() => void handlePay()}
            >
              {paying ? (
                <>
                  <ProgressLoader size="sm" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  {fees
                    ? `Pay ${formatBdt(fees.total)} with ${selected?.name}`
                    : `Pay with ${selected?.name}`}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Your booking is created after payment is confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<ProgressLoaderScreen label="Loading checkout…" />}>
      <CheckoutPageInner />
    </React.Suspense>
  )
}
