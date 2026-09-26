"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { ExpertCard } from "@/components/expert-card"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { asExpertList, mapExpertToItem, type ExpertItem } from "@/lib/experts-data"
import { cn } from "@/lib/utils"

export type LandingIcon = React.ComponentType<{ className?: string }>

export const TONES = {
  emerald: { solid: "bg-emerald-600 text-white", soft: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300", ring: "ring-emerald-500 border-emerald-500" },
  indigo: { solid: "bg-indigo-600 text-white", soft: "bg-indigo-50 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300", ring: "ring-indigo-500 border-indigo-500" },
  orange: { solid: "bg-orange-600 text-white", soft: "bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300", ring: "ring-orange-500 border-orange-500" },
  amber: { solid: "bg-amber-500 text-white", soft: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300", ring: "ring-amber-500 border-amber-500" },
  rose: { solid: "bg-rose-600 text-white", soft: "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300", ring: "ring-rose-500 border-rose-500" },
  red: { solid: "bg-red-700 text-white", soft: "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300", ring: "ring-red-600 border-red-600" },
  cyan: { solid: "bg-cyan-600 text-white", soft: "bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300", ring: "ring-cyan-500 border-cyan-500" },
  sky: { solid: "bg-sky-600 text-white", soft: "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300", ring: "ring-sky-500 border-sky-500" },
  teal: { solid: "bg-teal-600 text-white", soft: "bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300", ring: "ring-teal-500 border-teal-500" },
  violet: { solid: "bg-violet-600 text-white", soft: "bg-violet-50 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300", ring: "ring-violet-500 border-violet-500" },
  slate: { solid: "bg-slate-700 text-white", soft: "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-300", ring: "ring-slate-500 border-slate-500" },
} as const

export type Tone = keyof typeof TONES

export type LandingGroup = {
  key: string
  label: string
  bn?: string
  slugs: string[]
  keywords?: string[]
  resultLabel?: string
  tagline?: string
  topics?: string[]
  Icon: LandingIcon
  tone: Tone
}

export type LandingTile = {
  groupKey: string
  image: string
  alt: string
}

export type LandingTheme = {
  bg: string
  pattern: React.ReactNode
  glows: string[]
  eyebrow: string
  highlight: string
  primaryButton: string
  trustIcon: string
  tileShape: string
  focusRing: string
}

export type LandingConfig = {
  categoryMatch: RegExp
  eyebrow: string
  titleStart: string
  titleHighlight: string
  titleEnd: string
  bnSubtitle: string
  description: string
  primaryCta: string
  joinCta: string
  trust: { icon: LucideIcon; label: string }[]
  tiles: LandingTile[]
  groups: LandingGroup[]
  fallbackIcon: LandingIcon
  filterHeading: string
  filterSub: string
  allLabel: string
  allBn: string
  itemPlural: string
  searchPlaceholder: string
  emptyTitle: string
  emptyText: string
  theme: LandingTheme
}

type SortOption = "experience" | "name"

function detectGroup(expert: ExpertItem, groups: LandingGroup[], bySubcategory: Map<string, string>): string | null {
  const direct = bySubcategory.get(expert.subcategory.trim().toLowerCase())
  if (direct) return direct
  const haystack = [expert.subcategory, expert.headline, ...expert.skills].join(" ").toLowerCase()
  return groups.find((g) => g.keywords?.some((k) => haystack.includes(k)))?.key ?? null
}

function resultLabel(group: LandingGroup, itemPlural: string) {
  return group.resultLabel ?? `${group.label} ${itemPlural}`
}

export function CategoryLanding({ config }: { config: LandingConfig }) {
  const { theme } = config
  const { categories, isLoading: taxonomyLoading } = useTaxonomy()
  const [groupKey, setGroupKey] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortOption>("experience")
  const listRef = React.useRef<HTMLElement>(null)

  const category = React.useMemo(
    () => categories.find((c) => config.categoryMatch.test(c.name) || config.categoryMatch.test(c.slug ?? "")) ?? null,
    [categories, config.categoryMatch]
  )

  const groups = React.useMemo(() => {
    const known = new Set(config.groups.flatMap((g) => g.slugs))
    const extras: LandingGroup[] = (category?.subcategories ?? [])
      .filter((s) => !known.has(s.slug))
      .map((s) => ({ key: `sub-${s.slug}`, label: s.name, slugs: [s.slug], Icon: config.fallbackIcon, tone: "slate" }))
    return [...config.groups, ...extras]
  }, [config.groups, config.fallbackIcon, category])

  const groupByKey = React.useMemo(() => new Map(groups.map((g) => [g.key, g])), [groups])

  const bySubcategory = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const sub of category?.subcategories ?? []) {
      const match = groups.find((g) => g.slugs.includes(sub.slug))
      if (match) map.set(sub.name.trim().toLowerCase(), match.key)
    }
    return map
  }, [category, groups])

  const listUrl = category ? `${EXPERTS_API_URL}?per_page=100&category_id=${category.id}` : null
  const { data, isLoading: expertsLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(listUrl)

  const experts = React.useMemo(
    () =>
      asExpertList(data?.data).map((e) => {
        const item = mapExpertToItem(e)
        return { item, group: detectGroup(item, groups, bySubcategory) }
      }),
    [data, groups, bySubcategory]
  )

  const counts = React.useMemo(() => {
    const c = new Map<string, number>()
    for (const e of experts) if (e.group) c.set(e.group, (c.get(e.group) ?? 0) + 1)
    return c
  }, [experts])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = experts.filter(({ item, group }) => {
      const matchGroup = groupKey == null || group === groupKey
      const matchQ =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.bio.toLowerCase().includes(q) ||
        item.skills.some((s) => s.toLowerCase().includes(q)) ||
        item.languages.some((l) => l.toLowerCase().includes(q))
      return matchGroup && matchQ
    })
    return [...list].sort((a, b) =>
      sortBy === "name" ? a.item.name.localeCompare(b.item.name) : b.item.yearsExperience - a.item.yearsExperience
    )
  }, [experts, groupKey, search, sortBy])

  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  const selectAndScroll = (key: string) => {
    setGroupKey(key)
    scrollToList()
  }

  const active = groupKey ? groupByKey.get(groupKey) ?? null : null
  const activeTone = active ? TONES[active.tone] : null
  const loading = taxonomyLoading || (listUrl != null && expertsLoading && experts.length === 0)
  const tiles = config.tiles.filter((t) => groupByKey.has(t.groupKey))
  const heroChips = tiles.map((t) => groupByKey.get(t.groupKey)!)

  return (
    <div className="min-h-screen bg-background">
      <section className={cn("relative isolate overflow-hidden text-white", theme.bg)}>
        {theme.pattern}
        {theme.glows.map((g) => (
          <div key={g} className={cn("pointer-events-none absolute -z-10 rounded-full blur-3xl", g)} />
        ))}

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <p className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide", theme.eyebrow)}>
              <span className="size-1.5 rounded-full bg-current" />
              {config.eyebrow}
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {config.titleStart}{" "}
              <span className={cn("bg-clip-text text-transparent", theme.highlight)}>{config.titleHighlight}</span>
              {config.titleEnd}
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">{config.bnSubtitle}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{config.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {heroChips.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => selectAndScroll(g.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-white/90 backdrop-blur transition-colors hover:border-white/30 hover:bg-white/10"
                >
                  <span className={cn("flex size-7 items-center justify-center rounded-full", TONES[g.tone].solid)}>
                    <g.Icon className="size-4" />
                  </span>
                  {g.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className={theme.primaryButton} onClick={scrollToList}>
                {config.primaryCta}
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/become-an-expert">{config.joinCta}</Link>
              </Button>
            </div>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
              {config.trust.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col gap-1.5 text-slate-300">
                  <Icon className={cn("size-5", theme.trustIcon)} />
                  <dt className="text-xs sm:text-sm">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-2 lg:gap-4">
            {tiles.map((t, i) => {
              const g = groupByKey.get(t.groupKey)!
              return (
                <button
                  key={t.groupKey}
                  type="button"
                  onClick={() => selectAndScroll(g.key)}
                  className={cn(
                    "group relative aspect-3/5 overflow-hidden border border-white/15 shadow-2xl outline-none transition-transform duration-500 hover:-translate-y-1 focus-visible:ring-2 lg:aspect-3/4",
                    theme.tileShape,
                    theme.focusRing,
                    i % 2 === 1 && "lg:translate-y-10 lg:hover:translate-y-9"
                  )}
                  aria-label={`Show ${resultLabel(g, config.itemPlural)}`}
                >
                  <Image
                    src={t.image}
                    alt={t.alt}
                    fill
                    sizes="(min-width: 1024px) 260px, 25vw"
                    priority={i < 2}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 p-2 text-center sm:p-4">
                    <span className={cn("flex size-7 items-center justify-center rounded-full ring-2 ring-white/30 sm:size-10", TONES[g.tone].solid)}>
                      <g.Icon className="size-4 sm:size-5" />
                    </span>
                    <span className="line-clamp-2 text-[11px] font-semibold leading-tight sm:text-sm">{g.label}</span>
                    {g.bn && <span className="hidden text-xs text-white/70 sm:block">{g.bn}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section ref={listRef} id="experts-list" className="scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{config.filterHeading}</h2>
            <p className="text-sm text-muted-foreground">{config.filterSub}</p>
          </div>

          <div className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
            <FilterCard
              active={groupKey == null}
              onClick={() => setGroupKey(null)}
              label={config.allLabel}
              sub={config.allBn}
              count={experts.length}
              iconWrap="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              ring="ring-slate-900 border-slate-900 dark:ring-white dark:border-white"
              icon={
                <span className="grid grid-cols-2 gap-0.5">
                  {heroChips.slice(0, 4).map((g) => (
                    <g.Icon key={g.key} className="size-2.5" />
                  ))}
                </span>
              }
            />
            {groups.map((g) => (
              <FilterCard
                key={g.key}
                active={groupKey === g.key}
                onClick={() => setGroupKey(g.key)}
                label={g.label}
                sub={g.bn}
                count={counts.get(g.key) ?? 0}
                iconWrap={TONES[g.tone].solid}
                ring={TONES[g.tone].ring}
                icon={<g.Icon className="size-5" />}
              />
            ))}
          </div>

          {active && activeTone && active.tagline && (
            <div className={cn("mt-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5", activeTone.soft)}>
              <div className="flex items-center gap-3">
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", activeTone.solid)}>
                  <active.Icon className="size-5" />
                </span>
                <p className="text-sm font-medium">{active.tagline}</p>
              </div>
              {active.topics && active.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {active.topics.map((t) => (
                    <span key={t} className="rounded-full border border-current/20 bg-background/60 px-2.5 py-1 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={config.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <div className="flex w-fit rounded-lg border border-border bg-background p-0.5">
              {(["experience", "name"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    sortBy === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === "experience" ? "Most experienced" : "Name"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <ProgressLoader size="lg" label={`Loading ${config.itemPlural}…`} />
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-muted-foreground">
                {filtered.length} {active ? resultLabel(active, config.itemPlural).toLowerCase() : config.itemPlural} found
              </p>

              {filtered.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map(({ item, group }) => {
                    const meta = group ? groupByKey.get(group) : null
                    return (
                      <div key={item.id} className="relative">
                        {meta && (
                          <span className={cn("absolute left-3 top-3 z-10 inline-flex max-w-[70%] items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold shadow-md", TONES[meta.tone].solid)}>
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                              <meta.Icon className="size-3" />
                            </span>
                            <span className="truncate">{meta.label}</span>
                          </span>
                        )}
                        <ExpertCard expert={item} />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                  <div className="flex -space-x-2">
                    {(active ? [active] : heroChips).map((g) => (
                      <span key={g.key} className={cn("flex size-10 items-center justify-center rounded-full ring-4 ring-background", TONES[g.tone].solid)}>
                        <g.Icon className="size-5" />
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 font-semibold">
                    {experts.length === 0
                      ? config.emptyTitle
                      : active
                        ? `No ${resultLabel(active, config.itemPlural).toLowerCase()} match your search`
                        : `No ${config.itemPlural} match your search`}
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {experts.length === 0 ? config.emptyText : "Try another filter or clear your search."}
                  </p>
                  {experts.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-5"
                      onClick={() => {
                        setSearch("")
                        setGroupKey(null)
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function FilterCard({
  active,
  onClick,
  label,
  sub,
  count,
  icon,
  iconWrap,
  ring,
}: {
  active: boolean
  onClick: () => void
  label: string
  sub?: string
  count: number
  icon: React.ReactNode
  iconWrap: string
  ring: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-w-44 shrink-0 items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-0",
        active ? cn("shadow-md ring-2", ring) : "border-border"
      )}
    >
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconWrap)}>{icon}</span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-sm font-semibold leading-tight">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {sub ? `${sub} · ${count}` : count}
        </span>
      </span>
    </button>
  )
}
