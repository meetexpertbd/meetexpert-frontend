"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  Clock,
  Globe,
  GraduationCap,
  Info,
  MessageSquare,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { fetchExpertAvailableSlots, type ExpertAvailableSlot } from "@/lib/expert-api"
import type { ExpertDetail } from "@/lib/expert-detail-data"
import { cn } from "@/lib/utils"

type TabId = "info" | "experience" | "reviews" | "slots"

const TABS = [
  { id: "info" as const, label: "Info", icon: Info },
  { id: "experience" as const, label: "Experience", icon: Briefcase },
  { id: "reviews" as const, label: "Reviews", icon: MessageSquare },
  { id: "slots" as const, label: "Slots", icon: Calendar },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type BookableSlot = {
  id: string
  slotId: number
  date: string
  dayOfWeek: number
  label: string
  time: string
  start: string
  available: boolean
  price: number | null
}

function formatTime(value: string): string {
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  let h = Number(m[1])
  const min = m[2]
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${min} ${ampm}`
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function upcomingDates(daysAhead = 14): string[] {
  const out: string[] = []
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(toDateKey(d))
  }
  return out
}

function compareSlots(a: BookableSlot, b: BookableSlot): number {
  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
  if (a.start !== b.start) return a.start.localeCompare(b.start)
  return a.date.localeCompare(b.date)
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < Math.floor(value)
              ? "fill-amber-400 text-amber-400"
              : i < value
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

function mapApiSlots(date: string, slots: ExpertAvailableSlot[]): BookableSlot[] {
  const d = new Date(`${date}T00:00:00`)
  const dayOfWeek = d.getDay()
  const dayLabel = DAY_LABELS[dayOfWeek] ?? ""
  return slots.map((s) => {
    const time = `${formatTime(s.start)} – ${formatTime(s.end)}`
    return {
      id: `${date}-${s.id}`,
      slotId: s.id,
      date,
      dayOfWeek,
      label: `${dayLabel} · ${formatTime(s.start)}`,
      time,
      start: s.start,
      available: !s.is_booked,
      price: s.slot_price,
    }
  })
}

export function ExpertProfileClient({ expert }: { expert: ExpertDetail }) {
  const [tab, setTab] = React.useState<TabId>("info")
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null)
  const [bookingState, setBookingState] = React.useState<"idle" | "done">("idle")
  const [bookedSlotLabel, setBookedSlotLabel] = React.useState<string>("")
  const [slots, setSlots] = React.useState<BookableSlot[]>([])
  const [slotsLoading, setSlotsLoading] = React.useState(false)
  const [slotsError, setSlotsError] = React.useState<string | null>(null)
  const [slotsLoaded, setSlotsLoaded] = React.useState(false)

  const avgReview =
    expert.reviews.length > 0
      ? expert.reviews.reduce((a, r) => a + r.rating, 0) / expert.reviews.length
      : expert.rating

  const enabledDays = React.useMemo(
    () =>
      expert.availability
        .filter((d) => d.enabled && d.slots.length > 0)
        .slice()
        .sort((a, b) => a.day_of_week - b.day_of_week),
    [expert.availability]
  )

  const slotsByDay = React.useMemo(() => {
    const groups: { dayOfWeek: number; label: string; slots: BookableSlot[] }[] = []
    for (let dow = 0; dow < 7; dow++) {
      const daySlots = slots
        .filter((s) => s.dayOfWeek === dow)
        .slice()
        .sort(compareSlots)
      if (daySlots.length === 0) continue
      groups.push({
        dayOfWeek: dow,
        label: DAY_LABELS[dow],
        slots: daySlots,
      })
    }
    return groups
  }, [slots])

  const selectedSlot = React.useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  )

  React.useEffect(() => {
    if (tab !== "slots" || slotsLoaded) return

    let cancelled = false
    const enabledDow = new Set(enabledDays.map((d) => d.day_of_week))
    const dates = upcomingDates(14).filter((date) => {
      const dow = new Date(`${date}T00:00:00`).getDay()
      return enabledDow.has(dow)
    })

    setSlotsLoading(true)
    setSlotsError(null)

    void Promise.all(
      dates.map(async (date) => {
        try {
          const res = await fetchExpertAvailableSlots(expert.id, date)
          return mapApiSlots(date, res.data?.slots ?? [])
        } catch {
          return [] as BookableSlot[]
        }
      })
    )
      .then((groups) => {
        if (cancelled) return
        const flat = groups.flat().sort(compareSlots)
        setSlots(flat)
        setSlotsLoaded(true)
        if (flat.length === 0 && enabledDays.length === 0) {
          setSlotsError("This expert has no availability yet.")
        } else if (flat.length === 0) {
          setSlotsError("No open slots in the next two weeks.")
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsError("Could not load available slots.")
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tab, expert.id, enabledDays, slotsLoaded])

  const openSlotsTab = () => {
    setSelectedSlotId(null)
    setBookedSlotLabel("")
    setBookingState("idle")
    setTab("slots")
  }

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    void navigator.clipboard?.writeText(url).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <Link
            href="/experts"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to experts
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <div className="relative mx-auto shrink-0 lg:mx-0">
              <div className="relative size-36 overflow-hidden rounded-xl border border-border bg-muted sm:size-40">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>

              {expert.isOnline && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                  Online
                </span>
              )}

              {expert.verified && (
                <div className="absolute -right-1 -top-1 flex size-9 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-md">
                  <BadgeCheck className="size-4" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">{expert.category}</Badge>

                {expert.verified && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                  >
                    <ShieldCheck className="size-3.5" />
                    Verified
                  </Badge>
                )}
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {expert.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{expert.degreesLine}</p>

              <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
                <div className="bg-card px-4 py-3 text-center sm:text-left">
                  <p className="text-xs font-medium text-muted-foreground">Total experience</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {expert.yearsExperience}+ years
                  </p>
                </div>
                <div className="bg-card px-4 py-3 text-center sm:border-x sm:border-border sm:text-left">
                  <p className="text-xs font-medium text-muted-foreground">{expert.registrationLabel}</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{expert.registrationValue}</p>
                </div>
                <div className="bg-card px-4 py-3 text-center sm:text-left">
                  <p className="text-xs font-medium text-muted-foreground">Specialty</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">
                    {expert.subcategory || expert.category}
                  </p>
                </div>
              </div>

              {expert.currentWorkplace && (
                <p className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Current: </span>
                  {expert.currentWorkplace}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-border pt-6 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={share}
                  aria-label="Share profile"
                >
                  <Share2 className="size-4" />
                </Button>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Expert code</p>
                <p className="text-2xl font-bold tracking-tight text-primary">{expert.expertCode}</p>
                {expert.headline && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{expert.headline}</p>
                )}
              </div>

              {(expert.price || expert.duration) && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  {expert.price && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-muted-foreground">Session fee</span>
                      <span className="text-lg font-semibold text-foreground">{expert.price}</span>
                    </div>
                  )}
                  {expert.duration && (
                    <div className="mt-1 flex items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        Duration
                      </span>
                      <span className="font-medium text-foreground">{expert.duration}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                size="lg"
                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                type="button"
                disabled={enabledDays.length === 0}
                onClick={openSlotsTab}
              >
                <Video className="size-4" />
                See expert now
              </Button>
              {enabledDays.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  No availability published yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex gap-2 overflow-x-auto border-b border-border pb-px scrollbar-none">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-muted/30 p-4 sm:p-6">
            {tab === "info" && (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Shield className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Trust</p>
                        <p className="text-sm font-semibold text-foreground">Platform verified</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Identity</p>
                        <p className="text-sm font-semibold text-foreground">
                          {expert.identityVerified ? "ID checked" : "Pending"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Globe className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Languages</p>
                        <p className="text-sm font-semibold text-foreground">
                          {expert.languages.length > 0
                            ? expert.languages.slice(0, 2).join(", ")
                            : "—"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="size-5 text-primary" />
                      About & education
                    </CardTitle>
                    <CardDescription>{expert.bio}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {expert.education.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No education listed yet.</p>
                    ) : (
                      expert.education.map((edu, i) => (
                        <div
                          key={i}
                          className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                        >
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <GraduationCap className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{edu.degree}</p>
                            <p className="text-sm text-muted-foreground">{edu.institution}</p>
                            <p className="text-xs text-muted-foreground">{edu.year}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="size-5 text-primary" />
                      Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {expert.expertise.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {expert.expertise.map((tag) => (
                          <Badge key={tag} variant="secondary" className="font-normal">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {expert.languages.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="size-4 text-primary" />
                        {expert.languages.join(" · ")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {expert.demoVideoEmbedUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Video className="size-5 text-primary" />
                        Intro video
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                        <iframe
                          title={`${expert.name} intro video`}
                          src={expert.demoVideoEmbedUrl}
                          className="size-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {expert.portfolio.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="size-5 text-primary" />
                        Portfolio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {expert.portfolio.map((p, i) => (
                        <a
                          key={`${p.url}-${i}`}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm font-medium text-primary hover:underline"
                        >
                          {p.title || p.url}
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {(expert.responseTime || expert.joinedYear) && (
                  <Card>
                    <CardContent className="flex flex-wrap gap-4 text-sm">
                      {expert.responseTime && (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="size-4 text-primary" />
                          {expert.responseTime}
                        </span>
                      )}
                      {expert.joinedYear && (
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="size-4 text-primary" />
                          Member since {expert.joinedYear}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {tab === "experience" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {expert.workExperience.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full">
                    No work experience listed yet.
                  </p>
                ) : (
                  expert.workExperience.map((w, i) => (
                    <Card key={i} className="border-border bg-card">
                      <CardContent className="p-4 sm:p-5">
                        <p className="font-semibold text-foreground">{w.organization}</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Designation</p>
                            <p className="font-medium text-foreground">{w.designation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Details</p>
                            <p className="font-medium text-foreground">{w.department || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Employment</p>
                            <p className="font-medium text-foreground">{w.employment || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Period</p>
                            <p className="font-medium text-foreground">{w.period || "—"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {tab === "reviews" && (
              <div className="space-y-4">
                {expert.reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        Average from {expert.reviews.length} reviews
                      </p>
                      <div className="flex items-center gap-2">
                        <Stars value={avgReview} />
                        <span className="font-semibold text-foreground">{avgReview.toFixed(1)}</span>
                      </div>
                    </div>
                    <Separator />
                    {expert.reviews.map((r) => (
                      <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-foreground">{r.author}</p>
                          <Stars value={r.rating} />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === "slots" && (
              <div className="space-y-6">
                {enabledDays.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="size-5 text-primary" />
                        Weekly availability
                      </CardTitle>
                      <CardDescription>
                        Regular schedule{expert.price ? ` · ${expert.price} per session` : ""}
                        {expert.duration ? ` · ${expert.duration}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {enabledDays.map((day) => (
                        <div
                          key={day.day_of_week}
                          className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {DAY_LABELS[day.day_of_week]}
                          </p>
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {day.slots.map((slot, i) => (
                              <Badge key={`${slot.start}-${i}`} variant="secondary" className="font-normal">
                                {formatTime(slot.start)} – {formatTime(slot.end)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Video className="size-5 text-primary" />
                      Book a session
                    </CardTitle>
                    <CardDescription>
                      Upcoming open times for the next two weeks
                      {expert.price ? ` · ${expert.price}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookingState === "done" ? (
                      <div className="space-y-4 py-4 text-center">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <BadgeCheck className="size-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">Booked!</p>
                          <p className="text-sm text-muted-foreground">
                            Your session is confirmed for{" "}
                            <span className="font-medium text-foreground">{bookedSlotLabel}</span>.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBookingState("idle")
                            setSelectedSlotId(null)
                            setBookedSlotLabel("")
                          }}
                        >
                          Book another slot
                        </Button>
                      </div>
                    ) : slotsLoading ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        Loading available slots…
                      </p>
                    ) : slotsError ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">{slotsError}</p>
                    ) : (
                      <>
                        <div className="space-y-5">
                          {slotsByDay.map((group) => (
                            <div key={group.dayOfWeek}>
                              <p className="mb-2 text-sm font-semibold text-foreground">
                                {group.label}
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.slots.map((s) => {
                                  const isSelected = s.id === selectedSlotId
                                  return (
                                    <button
                                      key={s.id}
                                      type="button"
                                      disabled={!s.available}
                                      onClick={() => setSelectedSlotId(s.id)}
                                      className={cn(
                                        "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors",
                                        s.available
                                          ? "bg-card hover:bg-muted/30 hover:border-primary/30"
                                          : "cursor-not-allowed bg-muted/20 opacity-60",
                                        isSelected ? "border-primary bg-primary/5" : "border-border"
                                      )}
                                    >
                                      <span className="text-sm font-medium text-foreground">
                                        {formatTime(s.start)}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {s.available ? s.time : "Booked"}
                                        {" · "}
                                        {s.date}
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            className="sm:flex-1"
                            onClick={() => setSelectedSlotId(null)}
                          >
                            Clear
                          </Button>
                          <Button
                            type="button"
                            className="gap-2 sm:flex-1"
                            disabled={!selectedSlot || !selectedSlot.available}
                            onClick={() => {
                              if (!selectedSlot) return
                              setBookedSlotLabel(
                                `${DAY_LABELS[selectedSlot.dayOfWeek]} · ${formatTime(selectedSlot.start)} · ${selectedSlot.date}`
                              )
                              setBookingState("done")
                            }}
                          >
                            Confirm booking
                          </Button>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          Slot selection uses live availability. Payment checkout is not connected yet.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

