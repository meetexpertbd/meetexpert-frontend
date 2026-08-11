"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { BookingReviewDialog, RatingStars } from "@/components/booking-review-dialog"
import {
  fetchExpertBookings,
  fetchUserBookings,
  type BookingEntity,
  type BookingReview,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function ReviewsPage() {
  const token = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)
  const isExpert = authUser?.user_type === "expert"

  const [bookings, setBookings] = React.useState<BookingEntity[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [reviewTarget, setReviewTarget] = React.useState<BookingEntity | null>(null)

  const load = React.useCallback(async () => {
    if (!token) {
      setLoading(false)
      setError("Please sign in to view reviews.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = isExpert
        ? await fetchExpertBookings(token, { per_page: 100 })
        : await fetchUserBookings(token, { per_page: 100 })
      setBookings(res.data.data.filter((b) => b.review))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reviews")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [token, isExpert])

  React.useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return <ProgressLoaderScreen label="Loading reviews…" />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Reviews</h1>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="size-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-destructive">{error}</p>
            <Button type="button" className="mt-4" onClick={() => void load()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isExpert ? "Client Reviews" : "Your reviews"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Star className="size-12" />
            <p className="mt-4 text-sm">
              {isExpert
                ? "Reviews from clients will appear here."
                : "You haven’t reviewed any sessions yet."}
            </p>
            {!isExpert && (
              <Button className="mt-4" asChild>
                <Link href="/dashboard/bookings">Go to bookings</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const review = booking.review!
            const title = isExpert
              ? booking.user?.name ?? "Client"
              : booking.expert?.name ?? "Expert"
            return (
              <Card key={booking.id} className="border-border">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{title}</h2>
                      <RatingStars value={review.rating} size="sm" readOnly />
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      {formatDate(booking.scheduled_date)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment?.trim() || "No comment left."}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewTarget(booking)}
                  >
                    {isExpert ? "View" : "Edit"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {token && reviewTarget && (
        <BookingReviewDialog
          open={Boolean(reviewTarget)}
          onOpenChange={(open) => {
            if (!open) setReviewTarget(null)
          }}
          token={token}
          bookingId={reviewTarget.id}
          expertName={
            isExpert ? reviewTarget.user?.name : reviewTarget.expert?.name
          }
          review={reviewTarget.review ?? null}
          readOnly={isExpert}
          onSaved={(review: BookingReview) => {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === reviewTarget.id ? { ...b, review } : b
              )
            )
          }}
        />
      )}
    </div>
  )
}
