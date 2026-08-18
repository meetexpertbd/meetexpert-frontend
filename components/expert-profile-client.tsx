"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Check,
  Mail,
  Facebook,
  Linkedin,
  Lock,
  RotateCcw,
  LifeBuoy,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { resolveAvatarUrl } from "@/lib/auth-api"
import {
  fetchExpertAvailableSlots,
  fetchExpertReviews,
  type BookingReview,
  type ExpertAvailableSlot,
} from "@/lib/expert-api"
import { buildCheckoutPath } from "@/lib/checkout"
import type { ExpertDetail } from "@/lib/expert-detail-data"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type TabId = "info" | "experience" | "reviews"

const TABS = [
  { id: "info" as const, label: "Info", icon: Info },
  { id: "experience" as const, label: "Experience", icon: Briefcase },
  { id: "reviews" as const, label: "Reviews", icon: MessageSquare },
]

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LABELS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

type BookableSlot = {
  id: string
  slotId: number
  date: string
  dayOfWeek: number
  label: string
  time: string
  start: string
  end: string
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

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseDateKey(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

function formatCircleDate(date: string): string {
  const d = parseDateKey(date)
  const day = String(d.getDate()).padStart(2, "0")
  return `${day}-${MONTH_SHORT[d.getMonth()]}`
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

function isDateBeforeToday(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseDateKey(date).getTime() < today.getTime()
}

function isSlotPast(date: string, start: string): boolean {
  const m = start.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return false
  const slotAt = parseDateKey(date)
  slotAt.setHours(Number(m[1]), Number(m[2]), 0, 0)
  return slotAt.getTime() <= Date.now()
}

function isSlotBookable(slot: BookableSlot): boolean {
  return slot.available && !isSlotPast(slot.date, slot.start)
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

function useIsDesktop(breakpoint = "(min-width: 768px)") {
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia(breakpoint)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])

  return isDesktop
}

function getExpertProfileUrl(slug: string) {
  if (typeof window === "undefined") return `/experts/${slug}`
  return `${window.location.origin}/experts/${slug}`
}

async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through to execCommand
    }
  }

  try {
    const el = document.createElement("textarea")
    el.value = text
    el.setAttribute("readonly", "")
    el.style.position = "fixed"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
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
      end: s.end,
      available: !s.is_booked,
      price: s.slot_price,
    }
  })
}

export function ExpertProfileClient({ expert }: { expert: ExpertDetail }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isDesktop = useIsDesktop()

  const [tab, setTab] = React.useState<TabId>("info")
  const [bookingOpen, setBookingOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = React.useState<string | null>(null)
  const [bookingState, setBookingState] = React.useState<"idle" | "done">("idle")
  const [bookedSlotLabel, setBookedSlotLabel] = React.useState<string>("")
  const [slots, setSlots] = React.useState<BookableSlot[]>([])
  const [slotsLoading, setSlotsLoading] = React.useState(false)
  const [slotsError, setSlotsError] = React.useState<string | null>(null)
  const [slotsLoaded, setSlotsLoaded] = React.useState(false)
  const [bookingError, setBookingError] = React.useState<string | null>(null)
  const [reviews, setReviews] = React.useState<BookingReview[]>([])
  const [reviewsTotal, setReviewsTotal] = React.useState(0)
  const [reviewsPage, setReviewsPage] = React.useState(1)
  const [reviewsLastPage, setReviewsLastPage] = React.useState(1)
  const [reviewsLoading, setReviewsLoading] = React.useState(false)
  const [reviewsError, setReviewsError] = React.useState<string | null>(null)
  const [reviewsLoaded, setReviewsLoaded] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const copyResetRef = React.useRef<number | null>(null)

  const [profileUrl, setProfileUrl] = React.useState(`/experts/${expert.slug}`)
  const shareTitle = expert.name
  const shareText = expert.headline
    ? `${expert.name} — ${expert.headline}`
    : `Book a session with ${expert.name} on Meet Expert`

  const avgReview =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : expert.rating

  const enabledDays = React.useMemo(
    () =>
      expert.availability
        .filter((d) => d.enabled && d.slots.length > 0)
        .slice()
        .sort((a, b) => a.day_of_week - b.day_of_week),
    [expert.availability]
  )

  const bookingDates = React.useMemo(() => {
    const pool = upcomingDates(14)
    const today = toDateKey(new Date())
    let start = 0

    if (slotsLoaded) {
      const todayHadSlots = slots.some((s) => s.date === today)
      const todayBookable = slots.some(
        (s) => s.date === today && isSlotBookable(s)
      )
      if (todayHadSlots && !todayBookable) {
        const idx = pool.indexOf(today)
        start = idx >= 0 ? idx + 1 : 1
      }
    }

    return pool.slice(start, start + 7)
  }, [ slots, slotsLoaded])

  const slotsByDate = React.useMemo(() => {
    const map = new Map<string, BookableSlot[]>()
    for (const date of bookingDates) map.set(date, [])
    for (const slot of slots) {
      if (isDateBeforeToday(slot.date)) continue
      const list = map.get(slot.date)
      if (list) list.push(slot)
      else if (bookingDates.includes(slot.date)) map.set(slot.date, [slot])
    }
    for (const list of map.values()) {
      list.sort(compareSlots)
    }
    return map
  }, [slots, bookingDates])

  const slotsForSelectedDate = React.useMemo(() => {
    if (!selectedDate) return []
    return (slotsByDate.get(selectedDate) ?? []).filter(
      (s) => !isSlotPast(s.date, s.start)
    )
  }, [slotsByDate, selectedDate])

  const selectedSlot = React.useMemo(
    () => slots.find((s) => s.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  )

  React.useEffect(() => {
    if (!bookingOpen || slotsLoaded) return

    let cancelled = false
    const dates = upcomingDates(14)

    setSlotsLoading(true)
    setSlotsError(null)

    void Promise.all(
      dates.map(async (date) => {
        try {
          const res = await fetchExpertAvailableSlots(expert.slug, date)
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
          setSlotsError("No open slots in the next 7 days.")
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
  }, [bookingOpen, expert.slug, enabledDays, slotsLoaded])

  const loadReviews = React.useCallback(
    async (page: number, append = false) => {
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const res = await fetchExpertReviews(expert.slug, page)
        const list = res.data?.reviews ?? []
        const pagination = res.data?.pagination
        setReviews((prev) => (append ? [...prev, ...list] : list))
        setReviewsTotal(res.data?.total_reviews ?? pagination?.total ?? list.length)
        setReviewsPage(pagination?.current_page ?? page)
        setReviewsLastPage(pagination?.last_page ?? 1)
        setReviewsLoaded(true)
      } catch {
        setReviewsError("Could not load reviews.")
      } finally {
        setReviewsLoading(false)
      }
    },
    [expert.slug]
  )

  React.useEffect(() => {
    if (reviewsLoaded) return
    void loadReviews(1)
  }, [reviewsLoaded, loadReviews])

  React.useEffect(() => {
    if (!bookingOpen || slotsLoading || bookingDates.length === 0) return

    const firstWithSlots = bookingDates.find((date) =>
      (slotsByDate.get(date) ?? []).some(isSlotBookable)
    )
    const nextDate = firstWithSlots ?? bookingDates[0] ?? null

    setSelectedDate((current) => {
      if (current && bookingDates.includes(current)) {
        const currentSlots = (slotsByDate.get(current) ?? []).filter(
          (s) => !isSlotPast(s.date, s.start)
        )
        if (currentSlots.some(isSlotBookable) || currentSlots.length > 0) {
          return current
        }
      }
      return nextDate
    })
  }, [bookingOpen, slotsLoading, bookingDates, slotsByDate])

  const openBooking = () => {
    setSelectedSlotId(null)
    setSelectedDate(null)
    setBookedSlotLabel("")
    setBookingState("idle")
    setBookingError(null)
    setBookingOpen(true)
  }

  const loginHref = `/login?redirect=${encodeURIComponent(`/experts/${expert.slug}`)}`

  const handleCheckout = () => {
    if (!selectedSlot || !isSlotBookable(selectedSlot)) return
    setBookingError(null)
    if (!isHydrated) return

    const path = buildCheckoutPath({
      expertId: Number(expert.id),
      expertSlug: expert.slug,
      expertName: expert.name,
      expertImage: expert.image,
      headline: expert.headline || expert.subcategory,
      availabilitySlotId: selectedSlot.slotId,
      date: selectedSlot.date,
      start: selectedSlot.start,
      end: selectedSlot.end,
      price: expert.price,
      duration: expert.duration,
      amount: expert.slotPrice,
    })

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`)
      return
    }

    setBookingOpen(false)
    router.push(path)
  }

  React.useEffect(() => {
    setProfileUrl(getExpertProfileUrl(expert.slug))
  }, [expert.slug])

  React.useEffect(() => {
    return () => {
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current)
    }
  }, [])

  React.useEffect(() => {
    if (shareOpen) return
    setCopied(false)
    if (copyResetRef.current) {
      window.clearTimeout(copyResetRef.current)
      copyResetRef.current = null
    }
  }, [shareOpen])

  const markCopied = React.useCallback(() => {
    setCopied(true)
    if (copyResetRef.current) window.clearTimeout(copyResetRef.current)
    copyResetRef.current = window.setTimeout(() => setCopied(false), 2000)
  }, [])

  const copyProfileUrl = React.useCallback(async () => {
    const ok = await copyToClipboard(profileUrl)
    if (ok) markCopied()
  }, [profileUrl, markCopied])

  const share = React.useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: profileUrl,
        })
        return
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return
    }
    setShareOpen(true)
  }, [profileUrl, shareText, shareTitle])

  const shareTargets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${profileUrl}`)}`,
      className: "bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20",
      icon: MessageSquare,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      className: "bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20",
      icon: Facebook,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
      className: "bg-foreground/5 text-foreground hover:bg-foreground/10",
      icon: XIcon,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      className: "bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20",
      icon: Linkedin,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`,
      className: "bg-muted text-foreground hover:bg-muted/80",
      icon: Mail,
    },
  ]

  const sharePanelBody = (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
      <div className="grid grid-cols-3 gap-2">
        {shareTargets.map((target) => {
          const Icon = target.icon
          return (
            <a
              key={target.label}
              href={target.href}
              target={target.label === "Email" ? undefined : "_blank"}
              rel={target.label === "Email" ? undefined : "noopener noreferrer"}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl px-1 py-3 text-center text-xs font-medium transition-colors",
                target.className
              )}
              onClick={() => setShareOpen(false)}
            >
              <Icon className="size-5 shrink-0" />
              <span className="w-full truncate">{target.label}</span>
            </a>
          )
        })}
      </div>
      <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-muted/40 p-2 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 break-all px-2 py-1 text-xs text-muted-foreground">
          {profileUrl}
        </p>
        <Button
          type="button"
          size="sm"
          variant={copied ? "default" : "outline"}
          className="w-full min-w-28 shrink-0 sm:w-auto"
          onClick={() => void copyProfileUrl()}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  )

  const bookingPanelBody = (
    <div className="space-y-5">
      {bookingState === "done" ? (
        <div className="space-y-4 py-2 text-center">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/bookings">View bookings</Link>
            </Button>
            <Button
              type="button"
              onClick={() => {
                setBookingState("idle")
                setSelectedSlotId(null)
                setBookedSlotLabel("")
                setBookingError(null)
              }}
            >
              Book another slot
            </Button>
          </div>
        </div>
      ) : slotsLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <ProgressLoader size="md" label="Loading available slots…" />
        </div>
      ) : slotsError ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{slotsError}</p>
      ) : (
        <>
          {!token && isHydrated && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Link href={loginHref} className="font-medium text-primary hover:underline">
                Log in
              </Link>{" "}
              to confirm a booking.
            </p>
          )}

          <div className="flex gap-1 overflow-x-auto pt-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-between md:overflow-visible md:px-0">
            {bookingDates.map((date) => {
              const d = parseDateKey(date)
              const isSelected = date === selectedDate
              const hasSlots = (slotsByDate.get(date) ?? []).some(isSlotBookable)
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSlotId(null)
                    setBookingError(null)
                  }}
                  className="relative flex shrink-0 flex-col items-center gap-1"
                  aria-pressed={isSelected}
                  aria-label={`${DAY_LABELS[d.getDay()]} ${formatCircleDate(date)}`}
                >
                  {isSelected && (
                    <span className="absolute -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Check className="size-3 stroke-3" />
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex size-18 flex-col items-center justify-center rounded-lg border text-center transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : hasSlots
                          ? "border-border bg-card text-foreground hover:border-primary/40"
                          : "border-dashed border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide">
                      {DAY_LABELS_SHORT[d.getDay()]}
                    </span>
                    <span className="my-0.5 h-px w-8 bg-border" />
                    <span className="text-[11px] font-medium">{formatCircleDate(date)}</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {slotsForSelectedDate.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No slots available for this day.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Available time slots">
                {slotsForSelectedDate.map((s) => {
                  const isSelected = s.id === selectedSlotId
                  const bookable = isSlotBookable(s)
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex min-w-20 flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors sm:flex-none",
                        bookable
                          ? "bg-card hover:border-primary/40 hover:bg-muted/30"
                          : "cursor-not-allowed bg-muted/20 opacity-60",
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <input
                        type="radio"
                        name="booking-slot"
                        value={s.id}
                        checked={isSelected}
                        disabled={!bookable}
                        onChange={() => {
                          if (!bookable) return
                          setSelectedSlotId(s.id)
                          setBookingError(null)
                        }}
                        className="size-4 shrink-0 accent-primary disabled:cursor-not-allowed"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">
                          {formatTime(s.start)} – {formatTime(s.end)}
                        </span>
                        {!bookable && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Booked
                          </span>
                        )}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {bookingError && (
            <p className="text-sm text-destructive">{bookingError}</p>
          )}

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Your consultation includes</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>✓ {expert.duration || "Private"} video call</li>
              <li>✓ Direct access to {expert.name}</li>
              <li>✓ Secure meeting room</li>
              <li>✓ Booking saved in My Bookings</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() => {
                setSelectedSlotId(null)
                setBookingError(null)
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="gap-2 sm:flex-1"
              disabled={!selectedSlot || !isSlotBookable(selectedSlot)}
              onClick={handleCheckout}
            >
              {!token && isHydrated ? "Log in to checkout" : "Checkout"}
            </Button>
          </div>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Lock className="size-3" /> Secure session</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3" /> Reviewed expert</span>
            <span className="inline-flex items-center gap-1"><RotateCcw className="size-3" /> Cancel from My Bookings</span>
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-foreground">
              <LifeBuoy className="size-3" /> Support
            </Link>
          </p>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={expert.image}
                  alt={expert.name}
                  className="size-full object-cover"
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
              <p className="mt-1 text-sm text-muted-foreground">{expert.headline || expert.degreesLine}</p>
              {(avgReview > 0 || (expert.yearsExperience > 0) || expert.languages.length > 0) && (
                <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start">
                  {avgReview > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {avgReview.toFixed(1)}
                      {reviewsTotal > 0 ? ` · ${reviewsTotal} reviews` : ""}
                    </span>
                  )}
                  {expert.yearsExperience > 0 && <span>{expert.yearsExperience}+ years</span>}
                  {expert.languages.length > 0 && (
                    <span>{expert.languages.slice(0, 4).join(" · ")}</span>
                  )}
                </p>
              )}

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

            <div className="sticky top-20 flex w-full flex-col gap-4 border-t border-border pt-6 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void share()}
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

              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>✓ Private video call</li>
                <li>✓ Secure meeting room</li>
                <li>✓ Saved in My Bookings</li>
              </ul>

              <Button
                size="lg"
                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                type="button"
                disabled={enabledDays.length === 0}
                onClick={openBooking}
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
          <div className="flex gap-2 overflow-x-auto border-b border-border pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
                {id === "reviews" && reviewsLoaded && (
                  <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                    {reviewsTotal > 99 ? "99+" : reviewsTotal}
                  </span>
                )}
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
                {reviewsLoading && !reviewsLoaded ? (
                  <div className="flex justify-center py-10">
                    <ProgressLoader label="Loading reviews…" />
                  </div>
                ) : reviewsError && reviews.length === 0 ? (
                  <div className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">{reviewsError}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => void loadReviews(1)}>
                      Try again
                    </Button>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        {reviewsTotal} review{reviewsTotal === 1 ? "" : "s"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Stars value={avgReview} />
                        <span className="font-semibold text-foreground">{avgReview.toFixed(1)}</span>
                      </div>
                    </div>
                    <Separator />
                    {reviews.map((r) => {
                      const avatar = resolveAvatarUrl(r.user?.avatar_url)
                      return (
                        <div key={r.id} className="rounded-lg border border-border bg-card p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                                {avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={avatar}
                                    alt={r.user?.name ?? "Reviewer"}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {(r.user?.name ?? "U").slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                  {r.user?.name ?? "Client"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatReviewDate(r.created_at)}
                                </p>
                              </div>
                            </div>
                            <Stars value={r.rating} />
                          </div>
                          {r.comment && (
                            <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                          )}
                        </div>
                      )
                    })}
                    {reviewsPage < reviewsLastPage && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={reviewsLoading}
                          onClick={() => void loadReviews(reviewsPage + 1, true)}
                        >
                          {reviewsLoading ? "Loading…" : "Load more"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {isDesktop ? (
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="flex max-h-[85vh] w-full flex-col gap-4 overflow-x-hidden overflow-y-hidden sm:max-w-3xl">
            <DialogHeader className="shrink-0 pr-8">
              <DialogTitle>See {expert.name} now</DialogTitle>
              <DialogDescription>
                Pick an upcoming open slot
                {expert.price ? ` · ${expert.price}` : ""}
                {expert.duration ? ` · ${expert.duration}` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 overflow-x-hidden overflow-y-auto">{bookingPanelBody}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={bookingOpen} onOpenChange={setBookingOpen}>
          <DrawerContent className="overflow-hidden">
            <DrawerHeader className="shrink-0">
              <DrawerTitle>See {expert.name} now</DrawerTitle>
              <DrawerDescription>
                Pick an upcoming open slot
                {expert.price ? ` · ${expert.price}` : ""}
                {expert.duration ? ` · ${expert.duration}` : ""}
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{bookingPanelBody}</div>
          </DrawerContent>
        </Drawer>
      )}

      {isDesktop ? (
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
          <DialogContent className="max-h-[90dvh] w-full max-w-[min(28rem,calc(100%-2rem))] overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <DialogHeader className="min-w-0 pr-8">
              <DialogTitle className="truncate">Share {expert.name}</DialogTitle>
              <DialogDescription>Send this expert profile to someone else.</DialogDescription>
            </DialogHeader>
            {sharePanelBody}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={shareOpen} onOpenChange={setShareOpen}>
          <DrawerContent className="overflow-x-hidden data-[vaul-drawer-direction=bottom]:h-auto data-[vaul-drawer-direction=bottom]:max-h-[90dvh]">
            <DrawerHeader className="min-w-0 text-left">
              <DrawerTitle className="truncate">Share {expert.name}</DrawerTitle>
              <DrawerDescription>Send this expert profile to someone else.</DrawerDescription>
            </DrawerHeader>
            <div className="min-w-0 overflow-x-hidden overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {sharePanelBody}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {copied ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-80 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg sm:bottom-6"
        >
          <Check className="size-4 shrink-0" />
          Profile URL copied
        </div>
      ) : null}
    </div>
  )
}

