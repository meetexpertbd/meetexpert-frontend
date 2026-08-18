"use client"

import * as React from "react"
import { Quote, User, Star } from "lucide-react"
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

const FALLBACK_REVIEWS = [
  {
    name: "রাফিয়া আহমেদ",
    role: "Study Abroad Student",
    rating: 5,
    text: "Visa process এত জটিল লাগতো, কিন্তু expert এর guidance এ সব clear হয়ে গেল। Truly life-changing experience!",
  },
  {
    name: "Karim Hossain",
    role: "Business Owner",
    rating: 5,
    text: "Legal advice দরকার ছিল urgently। Video call এ lawyer এর সাথে কথা বলেই problem solve হয়ে গেল। Highly recommend!",
  },
  {
    name: "নুসরাত জাহান",
    role: "Parent",
    rating: 5,
    text: "বাচ্চার স্বাস্থ্য নিয়ে চিন্তিত ছিলাম। Doctor এর সাথে online consultation করে peace of mind পেয়েছি।",
  },
  {
    name: "Imran Kabir",
    role: "University Applicant",
    rating: 5,
    text: "SOP review এবং scholarship tips দুটোই পেয়েছি এক session এ। Expert দের quality সত্যিই impressive।",
  },
  {
    name: "সাবরিনা ইসলাম",
    role: "Working Professional",
    rating: 5,
    text: "Busy schedule এর মধ্যেও evening এ session বুক করতে পারলাম। Flexible timing আর verified experts।",
  },
  {
    name: "Tanvir Rahman",
    role: "First-time User",
    rating: 5,
    text: "প্রথমে trust করতে পারছিলাম না, কিন্তু first session এর পরই বুঝলাম। Genuine experts, clear advice.",
  },
]

type DisplayReview = {
  name: string
  role: string
  rating: number
  text: string
}

function UserReview() {
  const { data } = useGet<ApiEnvelope<ExpertEntity[]>>(`${EXPERTS_API_URL}?per_page=8`)
  const [reviews, setReviews] = React.useState<DisplayReview[]>(FALLBACK_REVIEWS)

  React.useEffect(() => {
    const experts = asExpertList(data?.data).filter((e) => e.slug)
    if (experts.length === 0) {
      setReviews(FALLBACK_REVIEWS)
      return
    }

    let cancelled = false
    void Promise.all(
      experts.slice(0, 6).map(async (expert) => {
        try {
          const res = await fetchExpertReviews(expert.slug, 1)
          return (res.data?.reviews ?? []).map((r: BookingReview) => ({
            name: r.user?.name ?? "Client",
            role: expert.name,
            rating: r.rating,
            text: r.comment?.trim() || "Great session.",
          }))
        } catch {
          return [] as DisplayReview[]
        }
      })
    ).then((groups) => {
      if (cancelled) return
      const flat = groups.flat().filter((r) => r.text).slice(0, 6)
      setReviews(flat.length > 0 ? flat : FALLBACK_REVIEWS)
    })

    return () => {
      cancelled = true
    }
  }, [data])

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-background via-primary/[0.04] to-background"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium text-primary">— Customer stories —</p>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What our users say
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
          Guidance from sessions on MeetExpert.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <article
              key={`${review.name}-${i}`}
              className={cn(
                "group relative flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
                "transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              )}
            >
              <Quote className="absolute right-4 top-4 size-8 text-primary/15" aria-hidden />
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(1, Math.min(5, review.rating)) }).map((_, j) => (
                  <Star key={j} className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UserReview
