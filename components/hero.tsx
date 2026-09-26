"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, BadgeCheck, Layers, Lock, Search, ShieldCheck, Star, UserPlus, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import { CATEGORY_PAGES, type CategoryPage } from "@/lib/category-pages"
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

const TILE_TONES: Record<string, { icon: string; glow: string; ring: string; text: string; chip: string }> = {
  "/lawyer": {
    icon: "bg-amber-400 text-amber-950",
    glow: "shadow-amber-400/50",
    ring: "ring-amber-300",
    text: "text-amber-300",
    chip: "border-amber-300/50 bg-amber-300/15 text-white",
  },
  "/study-abroad": {
    icon: "bg-sky-400 text-sky-950",
    glow: "shadow-sky-400/50",
    ring: "ring-sky-300",
    text: "text-sky-300",
    chip: "border-sky-300/50 bg-sky-300/15 text-white",
  },
  "/religious-scholar": {
    icon: "bg-emerald-400 text-emerald-950",
    glow: "shadow-emerald-400/50",
    ring: "ring-emerald-300",
    text: "text-emerald-300",
    chip: "border-emerald-300/50 bg-emerald-300/15 text-white",
  },
}

const ROTATE_MS = 3500

function CategoryTile({
  page,
  active,
  onActivate,
  className,
}: {
  page: CategoryPage
  active: boolean
  onActivate: () => void
  className?: string
}) {
  const tone = TILE_TONES[page.href]
  const mosaic = page.images.length > 1
  return (
    <Link
      href={page.href}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={cn(
        "group relative isolate flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-800 p-2.5 text-white shadow-xl ring-1 ring-white/10 outline-none transition-all duration-500 sm:rounded-3xl sm:p-4",
        active && cn("ring-2 ring-offset-2 ring-offset-[#071427]", tone?.ring),
        className
      )}
    >
      <div className={cn("absolute inset-0 -z-10 grid", mosaic && "grid-cols-2 grid-rows-2 gap-px")}>
        {page.images.map((src, i) => (
          <div key={src} className="relative overflow-hidden">
            <Image
              src={src}
              alt={i === 0 ? page.imageAlt : ""}
              fill
              sizes="(min-width: 1024px) 25vw, 33vw"
              priority={!mosaic}
              className={cn(
                "object-cover transition-transform duration-700",
                active ? "scale-105" : "scale-100 group-hover:scale-105"
              )}
            />
          </div>
        ))}
      </div>
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-linear-to-t from-slate-950/95 via-slate-950/35 to-slate-950/10 transition-opacity duration-500",
          active ? "opacity-80" : "opacity-100"
        )}
      />

      <span
        className={cn(
          "relative flex size-8 items-center justify-center rounded-xl shadow-lg transition-transform duration-500 sm:size-11 sm:rounded-2xl",
          tone?.icon,
          tone?.glow,
          active && "scale-110"
        )}
      >
        {active && (
          <span className={cn("absolute inset-0 animate-ping rounded-[inherit] opacity-40 motion-reduce:animate-none", tone?.icon)} />
        )}
        <page.icon className="relative size-4 sm:size-5" />
      </span>

      <div>
        <p className="text-xs font-bold leading-tight sm:text-lg">{page.label}</p>
        <p className={cn("text-[10px] font-medium sm:text-xs", tone?.text)}>{page.bn}</p>
        <span
          className={cn(
            "mt-2 hidden items-center gap-1 text-xs font-semibold transition-all duration-500 sm:inline-flex",
            active ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          Explore <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}

function FloatingExpert({ expert }: { expert: ExpertItem }) {
  const price = formatSlotPrice(expert.slotPrice)
  return (
    <Link
      href={expertProfileHref(expert)}
      className="animate-hero-float-slow absolute -bottom-6 -right-4 z-10 hidden w-64 items-center gap-3 rounded-2xl border border-white/15 bg-slate-900/85 p-3 text-white shadow-2xl backdrop-blur-md transition-colors hover:border-white/30 lg:flex"
    >
      <SafeImg src={expert.image} alt={expert.name} className="size-12 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-semibold">
          {expert.name}
          <BadgeCheck className="size-3.5 shrink-0 text-emerald-400" />
        </p>
        <p className="truncate text-[11px] text-slate-400">{expert.headline || expert.subcategory || expert.category}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px]">
          {expert.rating != null && expert.rating > 0 && (
            <span className="inline-flex items-center gap-0.5 text-amber-300">
              <Star className="size-3 fill-amber-300" />
              {expert.rating}
            </span>
          )}
          {price && <span className="font-semibold text-sky-300">{price}</span>}
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
  const [active, setActive] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % CATEGORY_PAGES.length), ROTATE_MS)
    return () => window.clearInterval(id)
  }, [paused])

  const { data } = useGet<ApiEnvelope<ExpertEntity[]>>(`${EXPERTS_API_URL}?per_page=8`)
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
              {CATEGORY_PAGES.map((p, i) => {
                const tone = TILE_TONES[p.href]
                const isActive = active === i
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    onMouseEnter={() => {
                      setActive(i)
                      setPaused(true)
                    }}
                    onMouseLeave={() => setPaused(false)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-300",
                      isActive
                        ? tone?.chip
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white"
                    )}
                  >
                    <p.icon className={cn("size-3.5", tone?.text)} />
                    {p.label}
                  </Link>
                )
              })}
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

          <div
            className="relative w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-linear-to-br from-amber-400/20 via-sky-500/25 to-emerald-400/20 blur-3xl" />
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 lg:h-128 lg:grid-cols-2 lg:grid-rows-2">
              {CATEGORY_PAGES.map((page, i) => (
                <CategoryTile
                  key={page.href}
                  page={page}
                  active={active === i}
                  onActivate={() => setActive(i)}
                  className={cn("aspect-3/4 lg:aspect-auto", i === 0 && "lg:row-span-2")}
                />
              ))}
            </div>

            {featured && <FloatingExpert expert={featured} />}

            <div className="animate-hero-float absolute -left-6 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/85 p-3 pr-4 shadow-xl backdrop-blur-md lg:flex">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="text-xs font-semibold">Verified experts</p>
                <p className="text-[11px] text-slate-400">ID &amp; credentials reviewed</p>
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
