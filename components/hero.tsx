"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Layers,
  Lock,
  Search,
  ShieldCheck,
  Star,
  UserPlus,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import { CATEGORY_PAGES } from "@/lib/category-pages"
import type { ApiEnvelope } from "@/lib/auth-api"
import {
  PLACEHOLDER_AVATAR,
  asExpertList,
  expertProfileHref,
  formatSlotPrice,
  mapExpertToItem,
  type ExpertItem,
} from "@/lib/experts-data"
import { cn } from "@/lib/utils"

function SafeImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = React.useState(false)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed ? PLACEHOLDER_AVATAR : src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

function FeaturedExpertCard({ expert }: { expert: ExpertItem }) {
  const price = formatSlotPrice(expert.slotPrice)
  return (
    <Link
      href={expertProfileHref(expert)}
      className="group relative block overflow-hidden rounded-3xl bg-slate-800 shadow-2xl ring-1 ring-white/10"
    >
      <div className="aspect-square lg:aspect-4/5">
        <SafeImg
          src={expert.image}
          alt={expert.name}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/20 to-transparent" />
      <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{expert.name}</p>
            <p className="truncate text-xs text-white/75">
              {expert.headline || expert.subcategory || expert.category}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold">
            <BadgeCheck className="size-3" />
            Verified
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm">
          <div className="flex items-center gap-3 text-white/85">
            {expert.rating != null && expert.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star className="size-3.5 fill-amber-300" />
                {expert.rating}
              </span>
            )}
            {expert.yearsExperience > 0 && <span>{expert.yearsExperience}+ yrs exp.</span>}
            {price && <span className="font-semibold text-white">{price}</span>}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300">
            Book
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function Hero() {
  const router = useRouter()
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"
  const { categories } = useTaxonomy()
  const [query, setQuery] = React.useState("")

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(`${EXPERTS_API_URL}?per_page=8`)
  const experts = React.useMemo(() => asExpertList(data?.data).map(mapExpertToItem), [data])

  const featured = experts[0]
  const avatars = experts.slice(0, 4)

  function goSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    router.push(q ? `/experts?q=${encodeURIComponent(q)}` : "/experts")
  }

  const stats = [
    { icon: BadgeCheck, value: experts.length > 0 ? `${experts.length}+` : "—", label: "Verified experts" },
    { icon: Layers, value: categories.length > 0 ? String(categories.length) : "—", label: "Expert categories" },
    { icon: Video, value: "1:1", label: "Private video sessions" },
    { icon: Lock, value: "100%", label: "Secure payment" },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#071427] text-white">
      <svg className="absolute inset-0 -z-10 size-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0H0V44" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="animate-hero-float pointer-events-none absolute -left-32 -top-24 -z-10 size-112 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="animate-hero-float-slow pointer-events-none absolute -right-24 top-1/3 -z-10 size-96 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 size-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:pb-14 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              {experts.length > 0
                ? `${experts.length} verified expert${experts.length === 1 ? "" : "s"} ready to book`
                : "Verified experts ready to book"}
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Get trusted advice from the{" "}
              <span className="bg-linear-to-r from-sky-300 via-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                right expert
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              আইনজীবী, স্টাডি অ্যাব্রড কনসালট্যান্ট বা ধর্মীয় স্কলারের সাথে ব্যক্তিগত ভিডিও সেশন বুক করুন।
            </p>

            <form onSubmit={goSearch} className="mt-7">
              <label htmlFor="hero-search" className="sr-only">
                What do you need help with?
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5 shadow-2xl shadow-sky-950/50 backdrop-blur-md focus-within:border-sky-300/50">
                <Search className="ml-3 size-5 shrink-0 text-slate-300" />
                <input
                  id="hero-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Land dispute, UK admission, Islamic guidance…"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 outline-none sm:text-base"
                />
                <Button type="submit" size="lg" className="h-11 rounded-xl bg-sky-500 px-5 text-white hover:bg-sky-400">
                  <span className="hidden sm:inline">Search</span>
                  <Search className="size-4 sm:hidden" />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Popular:</span>
              {CATEGORY_PAGES.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <p.icon className="size-3.5 text-sky-300" />
                  {p.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-100" asChild>
                <Link href="/experts">
                  Find an expert
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {!isExpert && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/become-an-expert">
                    Become an expert
                    <UserPlus className="size-4" />
                  </Link>
                </Button>
              )}
            </div>

            {avatars.length > 0 && (
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {avatars.map((e) => (
                    <SafeImg
                      key={e.id}
                      src={e.image}
                      alt={e.name}
                      className="size-10 rounded-full object-cover ring-2 ring-[#071427]"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">Reviewed professionals</span>
                  <br className="sm:hidden" /> <span className="text-slate-400">identity, credentials &amp; experience checked</span>
                </p>
              </div>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-linear-to-br from-sky-400/30 via-indigo-500/20 to-emerald-400/20 blur-2xl" />
            {isLoading && !featured ? (
              <div className="flex aspect-4/5 items-center justify-center rounded-3xl bg-white/5 ring-1 ring-white/10">
                <Video className="size-10 text-slate-400" />
              </div>
            ) : featured ? (
              <FeaturedExpertCard expert={featured} />
            ) : (
              <div className="flex aspect-4/5 flex-col items-center justify-center gap-3 rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10">
                <ShieldCheck className="size-12 text-sky-300" />
                <p className="text-sm text-slate-300">Verified experts are joining soon.</p>
              </div>
            )}

            <div className="animate-hero-float-slow absolute -left-6 top-10 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/80 p-3 pr-4 shadow-xl backdrop-blur-md sm:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold">Verified profile</p>
                <p className="text-[11px] text-slate-400">ID &amp; credentials reviewed</p>
              </div>
            </div>

            <div className="animate-hero-float absolute -right-5 top-1/2 hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/80 p-3 pr-4 shadow-xl backdrop-blur-md sm:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                <CalendarCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold">Session booked</p>
                <p className="text-[11px] text-slate-400">Private 1:1 video call</p>
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:mt-16 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3 bg-[#0a1a31] px-4 py-4 sm:px-6 sm:py-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sky-300 ring-1 ring-white/10">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <dd className="text-lg font-bold leading-tight sm:text-xl">{value}</dd>
                <dt className={cn("truncate text-xs text-slate-400 sm:text-sm")}>{label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
