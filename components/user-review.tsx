"use client"

import * as React from "react"
import { Quote, Star } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"
import { useGet } from "@/hooks/use-get"
import {
  EXPERTS_API_URL,
  fetchExpertReviews,
  type BookingReview,
  type ExpertEntity,
} from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { asExpertList } from "@/lib/experts-data"

type DisplayReview = {
  name: string
  role: string
  rating: number
  text: string
}

function UserReview() {
  const { data, isLoading: expertsLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(
    `${EXPERTS_API_URL}?per_page=8`
  )
  const [reviews, setReviews] = React.useState<DisplayReview[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const experts = asExpertList(data?.data).filter((e) => e.slug)
    if (expertsLoading) return

    if (experts.length === 0) {
      setReviews([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void Promise.all(
      experts.slice(0, 6).map(async (expert) => {
        try {
          const res = await fetchExpertReviews(expert.slug, 1)
          return (res.data?.reviews ?? []).map((r: BookingReview) => ({
            name: r.user?.name ?? "Client",
            role: expert.name,
            rating: r.rating,
            text: r.comment?.trim() || "",
          }))
        } catch {
          return [] as DisplayReview[]
        }
      })
    ).then((groups) => {
      if (cancelled) return
      setReviews(groups.flat().filter((r) => r.text).slice(0, 6))
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [data, expertsLoading])

  if (!loading && reviews.length === 0) return null

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <section className="relative isolate overflow-hidden bg-muted/30 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Customer stories"
          title="What our users say"
          description="Real feedback from sessions booked on MeetExpert."
          action={
            reviews.length > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <span className="text-3xl font-bold text-foreground">{average.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={cn(
                          "size-4",
                          j < Math.round(average) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    from {reviews.length} recent review{reviews.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            )
          }
        />

        {loading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {reviews.map((review, i) => (
              <article
                key={`${review.name}-${i}`}
                className="group relative mb-4 break-inside-avoid rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <Quote className="absolute right-5 top-5 size-9 text-primary/10" aria-hidden />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={cn(
                        "size-4",
                        j < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      )}
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">&ldquo;{review.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                      AVATAR_TONES[i % AVATAR_TONES.length]
                    )}
                  >
                    {initials(review.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Session with {review.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const AVATAR_TONES = [
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
]

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "C"
  )
}

export default UserReview
