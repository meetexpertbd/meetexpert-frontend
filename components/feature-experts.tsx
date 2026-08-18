"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { ExpertCard } from "@/components/expert-card"
import { useGet } from "@/hooks/use-get"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { FALLBACK_EXPERTS, asExpertList, mapExpertToItem, type ExpertItem } from "@/lib/experts-data"
import { CATEGORIES_GRID } from "@/lib/expert-categories"
import { cn } from "@/lib/utils"

type SortOption = "experience" | "name"

function filterAndSort(
  list: ExpertItem[],
  search: string,
  category: string,
  sortBy: SortOption
): ExpertItem[] {
  let out = list.filter((e) => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.headline.toLowerCase().includes(q) ||
      e.bio.toLowerCase().includes(q)
    const matchCategory = category === "All" || e.category === category
    return matchSearch && matchCategory
  })
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

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(
    `${EXPERTS_API_URL}?per_page=20`
  )

  const experts = React.useMemo(() => {
    const list = asExpertList(data?.data).map(mapExpertToItem)
    return list.length > 0 ? list : FALLBACK_EXPERTS
  }, [data])

  const categoryFilters = React.useMemo(() => {
    const names = categories.length > 0 ? categories.map((c) => c.name) : CATEGORIES_GRID.map((c) => c.label)
    return ["All", ...names]
  }, [categories])

  const filtered = React.useMemo(
    () => filterAndSort(experts, "", category, sortBy),
    [experts, category, sortBy]
  )

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const card = scrollRef.current.querySelector<HTMLElement>("[data-expert-card]")
    const gap = 16
    const step = ((card?.offsetWidth ?? 280) + gap) * (dir === "left" ? -1 : 1)
    scrollRef.current.scrollBy({ left: step, behavior: "smooth" })
  }

  return (
    <section className="border-y border-border bg-muted/10 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">— Featured —</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Top verified experts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Book a private video session with reviewed professionals.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/experts">
              View all experts <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {categoryFilters.map((cat) => (
            <Badge
              key={cat}
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
          <div className="ml-auto flex rounded-lg border border-border bg-background p-0.5">
            {(["experience", "name"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  sortBy === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "experience" ? "Experience" : "Name"}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-8">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {isLoading && asExpertList(data?.data).length === 0 ? (
              <div className="flex w-full items-center justify-center py-16">
                <ProgressLoader size="lg" label="Loading experts…" />
              </div>
            ) : (
              filtered.map((expert) => (
                <div
                  key={expert.id}
                  data-expert-card
                  className="w-72 shrink-0 sm:w-80"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <ExpertCard expert={expert} compact />
                </div>
              ))
            )}
          </div>
          {filtered.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Previous experts"
                className="absolute left-0 top-1/2 z-10 -translate-x-2 -translate-y-1/2 rounded-full border border-border bg-card p-2 shadow-md hover:bg-muted md:-translate-x-4"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next experts"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full border border-border bg-card p-2 shadow-md hover:bg-muted md:translate-x-4"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
