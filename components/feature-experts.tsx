"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { ExpertCard } from "@/components/expert-card"
import { SectionHeading } from "@/components/section-heading"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { asExpertList, mapExpertToItem, type ExpertItem } from "@/lib/experts-data"
import { cn } from "@/lib/utils"

type SortOption = "experience" | "name"

function filterAndSort(list: ExpertItem[], category: string, sortBy: SortOption): ExpertItem[] {
  const out = list.filter((e) => category === "All" || e.category === category)
  return [...out].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return b.yearsExperience - a.yearsExperience
  })
}

export function FeatureExperts() {
  const [category, setCategory] = React.useState<string>("All")
  const [sortBy, setSortBy] = React.useState<SortOption>("experience")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { categories } = useTaxonomy()

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(`${EXPERTS_API_URL}?per_page=20`)

  const experts = React.useMemo(() => asExpertList(data?.data).map(mapExpertToItem), [data])

  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const e of experts) map.set(e.category, (map.get(e.category) ?? 0) + 1)
    return map
  }, [experts])

  const categoryFilters = React.useMemo(() => ["All", ...categories.map((c) => c.name)], [categories])

  const filtered = React.useMemo(
    () => filterAndSort(experts, category, sortBy),
    [experts, category, sortBy]
  )

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector<HTMLElement>("[data-expert-card]")
    const step = ((card?.offsetWidth ?? 280) + 20) * (dir === "left" ? -1 : 1)
    scrollRef.current.scrollBy({ left: step, behavior: "smooth" })
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Featured experts"
          title="Meet top verified experts"
          description="Hand-reviewed professionals ready for a private 1:1 video session."
          action={
            <div className="flex items-center gap-2">
              {filtered.length > 1 && (
                <div className="hidden gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => scroll("left")}
                    aria-label="Previous experts"
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scroll("right")}
                    aria-label="Next experts"
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              )}
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/experts">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          }
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
            {categoryFilters.map((cat) => {
              const active = category === cat
              const count = cat === "All" ? experts.length : counts.get(cat) ?? 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {cat}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[11px] tabular-nums",
                      active ? "bg-white/20" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex shrink-0 self-start rounded-full border border-border bg-card p-1 sm:ml-auto sm:self-auto">
            {(["experience", "name"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  sortBy === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "experience" ? "Most experienced" : "A–Z"}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="-mx-4 mt-8 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {isLoading && experts.length === 0 ? (
            <div className="flex w-full items-center justify-center py-16">
              <ProgressLoader size="lg" label="Loading experts…" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium text-foreground">No experts in this category yet</p>
              <button type="button" onClick={() => setCategory("All")} className="text-sm text-primary hover:underline">
                Show all experts
              </button>
            </div>
          ) : (
            filtered.map((expert) => (
              <div key={expert.id} data-expert-card className="w-72 shrink-0 snap-start sm:w-80">
                <ExpertCard expert={expert} compact />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
