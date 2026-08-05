"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  User,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { resolveAvatarUrl } from "@/lib/auth-api"
import {
  fetchExpertBookings,
  fetchUserBookings,
  type BookingEntity,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "confirmed" | "cancelled"

function formatTime(value: string | null | undefined): string {
  if (!value) return "—"
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  let h = Number(m[1])
  const min = m[2]
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${min} ${ampm}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatPrice(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null
  return `${value.toLocaleString("en-BD")} BDT`
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  if (normalized === "confirmed") {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        Confirmed
      </Badge>
    )
  }
  if (normalized === "cancelled") {
    return (
      <Badge variant="outline" className="border-destructive/40 text-destructive">
        Cancelled
      </Badge>
    )
  }
  return <Badge variant="secondary">{status}</Badge>
}

function BookingAvatar({
  src,
  name,
}: {
  src: string | null | undefined
  name: string
}) {
  const [failed, setFailed] = React.useState(false)
  const url = resolveAvatarUrl(src)

  React.useEffect(() => {
    setFailed(false)
  }, [url])

  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <User className="size-7 text-muted-foreground" />
      )}
    </div>
  )
}

function UserBookingCard({ booking }: { booking: BookingEntity }) {
  const expert = booking.expert
  const price = formatPrice(expert?.slot_price)
  const expertHref = expert?.id != null ? `/experts/${expert.id}` : null

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        {expertHref ? (
          <Link
            href={expertHref}
            className="mx-auto block shrink-0 transition-opacity hover:opacity-90 sm:mx-0"
            aria-label={`View ${expert?.name ?? "expert"} profile`}
          >
            <BookingAvatar src={expert?.avatar_url} name={expert?.name ?? "Expert"} />
          </Link>
        ) : (
          <div className="mx-auto sm:mx-0">
            <BookingAvatar src={expert?.avatar_url} name={expert?.name ?? "Expert"} />
          </div>
        )}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {expertHref ? (
              <Link
                href={expertHref}
                className="truncate text-base font-semibold text-foreground hover:text-primary hover:underline"
              >
                {expert?.name ?? "Expert"}
              </Link>
            ) : (
              <h2 className="truncate text-base font-semibold text-foreground">
                {expert?.name ?? "Expert"}
              </h2>
            )}
            <StatusBadge status={booking.status} />
          </div>
          {expert?.professional_headline && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {expert.professional_headline}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              {formatDate(booking.scheduled_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </span>
            {price && <span>{price}</span>}
          </div>
          {booking.notes && (
            <p className="mt-2 text-sm text-muted-foreground">
              Note: {booking.notes}
            </p>
          )}
        </div>

        {booking.status.toLowerCase() === "confirmed" ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={`/dashboard/meeting/${booking.id}`}>
              <Video className="size-4" />
              Join
            </Link>
          </Button>
        ) : expertHref ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={expertHref}>View expert</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ExpertBookingCard({ booking }: { booking: BookingEntity }) {
  const client = booking.user

  return (
    <Card className="border-border">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="mx-auto sm:mx-0">
          <BookingAvatar src={client?.avatar_url} name={client?.name ?? "Client"} />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="truncate text-base font-semibold text-foreground">
              {client?.name ?? "Client"}
            </h2>
            <StatusBadge status={booking.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            {client?.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" />
                {client.email}
              </span>
            )}
            {client?.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-primary" />
                {client.phone}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              {formatDate(booking.scheduled_date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
            </span>
          </div>
          {booking.notes && (
            <p className="mt-2 text-sm text-muted-foreground">
              Note: {booking.notes}
            </p>
          )}
        </div>

        {booking.status.toLowerCase() === "confirmed" ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" asChild>
            <Link href={`/dashboard/meeting/${booking.id}`}>
              <Video className="size-4" />
              Join
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function BookingsPage() {
  const token = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)
  const isExpert = authUser?.user_type === "expert"

  const [filter, setFilter] = React.useState<StatusFilter>("all")
  const [bookings, setBookings] = React.useState<BookingEntity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [total, setTotal] = React.useState(0)

  const load = React.useCallback(async () => {
    if (!token) {
      setLoading(false)
      setError("Please sign in to view your bookings.")
      setBookings([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = {
        status: filter === "all" ? undefined : filter,
        per_page: 50,
      } as const
      const res = isExpert
        ? await fetchExpertBookings(token, params)
        : await fetchUserBookings(token, params)
      setBookings(res.data.data)
      setTotal(res.data.meta?.total ?? res.data.data.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookings")
      setBookings([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [token, filter, isExpert])

  React.useEffect(() => {
    void load()
  }, [load])

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "confirmed", label: "Confirmed" },
    { id: "cancelled", label: "Cancelled" },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isExpert
              ? "Sessions booked with you"
              : "Your booked consultation slots"}
            {!loading && total > 0 ? ` · ${total}` : ""}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 self-start"
          onClick={() => void load()}
          disabled={loading || !token}
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ProgressLoaderScreen label="Loading bookings…" />
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="size-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-destructive">{error}</p>
            <Button type="button" className="mt-4" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No bookings yet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Calendar className="size-12" />
            <p className="mt-4 text-sm">
              {filter === "all"
                ? isExpert
                  ? "No clients have booked sessions with you yet."
                  : "You haven’t booked any sessions yet."
                : `No ${filter} bookings found.`}
            </p>
            {!isExpert && (
              <Button className="mt-4" asChild>
                <Link href="/experts">Browse experts</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) =>
            isExpert ? (
              <ExpertBookingCard key={booking.id} booking={booking} />
            ) : (
              <UserBookingCard key={booking.id} booking={booking} />
            )
          )}
        </div>
      )}
    </div>
  )
}
