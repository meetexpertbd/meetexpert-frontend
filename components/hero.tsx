"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, UserPlus, BadgeCheck, Star, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import {
  FALLBACK_EXPERTS,
  PLACEHOLDER_AVATAR,
  asExpertList,
  expertProfileHref,
  formatSlotPrice,
  mapExpertToItem,
} from "@/lib/experts-data"
import { CATEGORIES_GRID } from "@/lib/expert-categories"
import { cn } from "@/lib/utils"

const FALLBACK_CHIPS = CATEGORIES_GRID.map((c) => c.label)

function HeroPortrait({
  name,
  role,
  image,
  rating,
  sessions,
  years,
  price,
  duration,
  href,
}: {
  name: string
  role: string
  image: string
  rating?: number | null
  sessions?: number | null
  years?: number | null
  price?: string | null
  duration?: string | null
  href: string
}) {
  const [failed, setFailed] = React.useState(false)
  const src = failed ? PLACEHOLDER_AVATAR : image

  return (
    <Link
      href={href}
      className="relative block w-full max-w-md overflow-hidden rounded-2xl bg-muted shadow-xl ring-1 ring-border/60"
    >
      <div className="aspect-4/3 sm:aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/45 p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-white/80">{role}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
              <BadgeCheck className="size-3" />
              Verified
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90">
            {rating != null && rating > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star className="size-3.5 fill-amber-300" />
                {rating}
              </span>
            )}
            {sessions != null && sessions > 0 && <span>{sessions}+ sessions</span>}
            {years != null && years > 0 && <span>{years}+ yrs</span>}
          </div>
          {(price || duration) && (
            <p className="mt-1 text-sm text-white/90">
              {[duration, price].filter(Boolean).join(" · ")}
            </p>
          )}
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

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(
    `${EXPERTS_API_URL}?per_page=8`
  )

  const experts = React.useMemo(() => {
    const list = asExpertList(data?.data).map(mapExpertToItem)
    return list.length > 0 ? list : FALLBACK_EXPERTS
  }, [data])

  const featured = experts[0]
  const chips = categories.length > 0 ? categories.map((c) => c.name) : FALLBACK_CHIPS
  const liveCount = asExpertList(data?.data).length

  function goSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const q = query.trim()
    router.push(q ? `/experts?q=${encodeURIComponent(q)}` : "/experts")
  }

  function goCategory(name: string) {
    const match = categories.find((c) => c.name === name)
    if (match) {
      router.push(`/experts?category_id=${match.id}`)
      return
    }
    router.push(`/experts?q=${encodeURIComponent(name)}`)
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              {liveCount > 0
                ? `${liveCount} verified expert${liveCount === 1 ? "" : "s"} ready to book`
                : "Verified experts ready to book"}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Get Trusted Advice From The Right Expert
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Book a private 1-to-1 video session with verified professionals.
            </p>

            <form onSubmit={goSearch} className="space-y-3">
              <label htmlFor="hero-search" className="text-sm font-medium text-foreground">
                What do you need help with?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hero-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search lawyers, study abroad experts, career mentors..."
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
                <Button type="submit" size="lg" className="h-11">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              {chips.slice(0, 6).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => goCategory(name)}
                  className={cn(
                    "rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm",
                    "transition-colors hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/experts">
                  Find an Expert
                  <Search className="size-4" />
                </Link>
              </Button>
              {!isExpert && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/become-an-expert">
                    Become an Expert
                    <UserPlus className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            {isLoading && !featured ? (
              <div className="flex aspect-4/3 w-full max-w-md items-center justify-center rounded-2xl bg-muted sm:aspect-square">
                <Video className="size-10 text-muted-foreground" />
              </div>
            ) : featured ? (
              <HeroPortrait
                name={featured.name}
                role={featured.headline || featured.subcategory || featured.category}
                image={featured.image}
                rating={featured.rating}
                sessions={featured.sessions}
                years={featured.yearsExperience}
                price={formatSlotPrice(featured.slotPrice)}
                duration={featured.duration}
                href={expertProfileHref(featured)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
