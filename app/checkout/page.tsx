"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, ExternalLink, Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import { createBooking } from "@/lib/expert-api"
import { PLACEHOLDER_AVATAR } from "@/lib/experts-data"
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHODS,
  checkoutDraftFromSearch,
  checkoutFees,
  extractPaymentUrl,
  formatBdt,
  saveCheckoutSession,
} from "@/lib/checkout"
import { PaymentMethodIcon } from "@/components/payment-icons"
import { useAuthStore } from "@/store/auth-store"

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

function apiErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) {
    const body = e.body
    if (body && typeof body === "object" && "errors" in body) {
      const errors = (body as { errors?: Record<string, string[] | string> }).errors
      const first = errors
        ? Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [v]))[0]
        : null
      return first || e.message
    }
    return e.message
  }
  if (e instanceof Error) return e.message
  return fallback
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

  const method = DEFAULT_PAYMENT_METHOD
  const selected = PAYMENT_METHODS[0]
  const [paying, setPaying] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [redirecting, setRedirecting] = React.useState(false)
  const [gatewayUrl, setGatewayUrl] = React.useState<string | null>(null)
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
      const res = await createBooking(token, {
        expert_id: draft.expertId,
        availability_slot_id: draft.availabilitySlotId,
        date: draft.date,
        payment_method: method,
      })

      const createdPayment = res.data?.payment
      const createdBooking = res.data?.booking
      if (!createdPayment?.id || !createdBooking?.id) {
        throw new Error("Payment was not created. Please try again.")
      }

      saveCheckoutSession({
        bookingId: createdBooking.id,
        paymentId: createdPayment.id,
        expertSlug: draft.expertSlug,
      })

      const paymentUrl = extractPaymentUrl(res.data?.checkout)
      if (!paymentUrl) {
        setError("Unable to start SSLCommerz payment")
        return
      }

      setGatewayUrl(paymentUrl)
      setRedirecting(true)
      window.location.assign(paymentUrl)
    } catch (e) {
      setError(apiErrorMessage(e, "Could not start payment."))
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
  const fees = draft.amount != null ? checkoutFees(draft.amount) : null

  if (redirecting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ProgressLoader size="lg" className="mx-auto" />
        <h1 className="mt-4 text-xl font-bold">Redirecting to SSLCommerz…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete payment on SSLCommerz. You will return to MeetExpert after confirmation.
        </p>
        {gatewayUrl && (
          <Button className="mt-6 gap-2" asChild>
            <a href={gatewayUrl}>
              Continue to SSLCommerz
              <ExternalLink className="size-4" />
            </a>
          </Button>
        )}
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
        Review your session and pay with SSLCommerz.
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
              <p className="mt-0.5 text-xs text-muted-foreground">
                SSLCommerz is the only available payment method.
              </p>
              <div
                className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${selected.accent}`}
              >
                <PaymentMethodIcon id={selected.id} className="size-11 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{selected.name}</span>
                  <span className="block text-sm text-muted-foreground">{selected.hint}</span>
                </span>
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
                  Starting SSLCommerz…
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  {fees
                    ? `Pay ${formatBdt(fees.total)} with SSLCommerz`
                    : "Pay with SSLCommerz"}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You will be redirected to SSLCommerz. Booking confirms after successful payment.
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
