"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star,
  User,
  Users,
  Video,
  Wallet,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { RatingStars } from "@/components/booking-review-dialog"
import { resolveAvatarUrl } from "@/lib/auth-api"
import {
  fetchExpertDashboard,
  type BookingEntity,
  type BookingReview,
  type ExpertDashboardData,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

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
  })
}

function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${value.toLocaleString("en-BD")} BDT`
}

function formatReviewDate(value: string | null | undefined): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function Avatar({ src, name, size = "md" }: { src?: string | null; name: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = React.useState(false)
  const url = resolveAvatarUrl(src)
  const box = size === "sm" ? "size-10" : "size-14"

  React.useEffect(() => {
    setFailed(false)
  }, [url])

  return (
    <div className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted", box)}>
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <User className={size === "sm" ? "size-4 text-muted-foreground" : "size-6 text-muted-foreground"} />
      )}
    </div>
  )
}

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token)
  const [data, setData] = React.useState<ExpertDashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!token) {
      setLoading(false)
      setError("Please sign in to view your dashboard.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetchExpertDashboard(token)
      setData(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <ProgressLoaderScreen label="Loading dashboard…" />
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-destructive">{error ?? "Dashboard unavailable."}</p>
            <Button type="button" className="mt-4" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { profile, stats, upcoming_bookings, recent_reviews } = data
  const profileHref = profile.slug ? `/experts/${profile.slug}` : null

  const statCards = [
    {
      label: "Today’s sessions",
      value: String(stats.todays_bookings),
      icon: Calendar,
      color: "text-sky-600 bg-sky-100 dark:bg-sky-900/30",
    },
    {
      label: "Upcoming",
      value: String(stats.upcoming_bookings),
      icon: Clock,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30",
    },
    {
      label: "Completed",
      value: String(stats.completed_bookings),
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Cancelled",
      value: String(stats.cancelled_bookings),
      icon: XCircle,
      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
    },
    {
      label: "Total bookings",
      value: String(stats.total_bookings),
      icon: Users,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Reviews",
      value: stats.average_rating != null
        ? `${stats.average_rating} · ${stats.total_reviews}`
        : String(stats.total_reviews),
      icon: Star,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Estimated earnings",
      value: formatPrice(stats.estimated_earnings),
      icon: Wallet,
      color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatar_url} name={profile.name} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.professional_headline || "Your expert dashboard"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {profile.expert_code && (
                <Badge variant="secondary">{profile.expert_code}</Badge>
              )}
              {profile.slot_price != null && (
                <Badge variant="outline">{formatPrice(profile.slot_price)} / session</Badge>
              )}
            </div>
          </div>
        </div>
        {profileHref && (
          <Button variant="outline" size="sm" className="gap-1.5 self-start" asChild>
            <Link href={profileHref} target="_blank">
              <ExternalLink className="size-4" />
              View profile
            </Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn("flex size-11 items-center justify-center rounded-xl", stat.color)}>
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Upcoming sessions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming_bookings.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming sessions.
              </p>
            ) : (
              upcoming_bookings.map((booking: BookingEntity) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <Avatar
                    src={booking.user?.avatar_url}
                    name={booking.user?.name ?? "Client"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">
                      {booking.user?.name ?? "Client"}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(booking.scheduled_date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                      </span>
                    </p>
                  </div>
                  <Button size="sm" className="gap-1.5" asChild>
                    <Link href={`/dashboard/meeting/${booking.id}`}>
                      <Video className="size-4" />
                      Join
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent reviews</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/reviews">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_reviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No reviews yet.
              </p>
            ) : (
              recent_reviews.map((review: BookingReview) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        src={review.user?.avatar_url}
                        name={review.user?.name ?? "Client"}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {review.user?.name ?? "Client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatReviewDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <RatingStars value={review.rating} size="sm" readOnly />
                  </div>
                  {review.comment && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
