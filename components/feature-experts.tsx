"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Video, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGet } from "@/hooks/use-get"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { mapExpertToItem, type ExpertItem } from "@/lib/experts-data"
import { useTaxonomy } from "@/hooks/use-taxonomy"
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
  out = [...out].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    return b.yearsExperience - a.yearsExperience
  })
  return out
}

export function FeatureExperts() {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string>("All")
  const [sortBy, setSortBy] = React.useState<SortOption>("experience")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { categories } = useTaxonomy()

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(
    `${EXPERTS_API_URL}?per_page=20`
  )

  const experts = React.useMemo(
    () => (data?.data ?? []).map(mapExpertToItem),
    [data]
  )

  const categoryFilters = React.useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories]
  )

  const filtered = React.useMemo(
    () => filterAndSort(experts, search, category, sortBy),
    [experts, search, category, sortBy]
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
              Top Experts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Book verified professionals for video consultation.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/experts">View all experts <ArrowRight className="size-4" /></Link>
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search experts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <div className="flex rounded-lg border border-border bg-background p-0.5">
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
          </div>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        <div className="relative mt-8">
          <div
            ref={scrollRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  data-expert-card
                  className="h-105 w-65 shrink-0 sm:w-70"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Card className="flex h-full flex-col overflow-hidden">
                    <Skeleton className="h-44 w-full shrink-0 rounded-none" />
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="mt-auto h-3 w-24" />
                    </CardContent>
                    <div className="border-t border-border p-4">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </Card>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <Search className="size-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No experts match your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSearch("")
                    setCategory("All")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filtered.map((expert) => (
                <div
                  key={expert.id}
                  data-expert-card
                  className="h-105 w-65 shrink-0 sm:w-70"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                      <div className="absolute right-2 top-2">
                        <Badge variant="secondary" className="text-xs">
                          {expert.yearsExperience}+ yrs
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <Badge variant="outline" className="w-fit max-w-full truncate text-xs">
                        {expert.category}
                      </Badge>
                      <h3 className="line-clamp-1 text-base font-semibold leading-snug text-foreground">
                        {expert.name}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {expert.headline || expert.bio}
                      </p>
                      <p className="mt-auto truncate text-xs text-muted-foreground">
                        {expert.subcategory || expert.expertCode}
                      </p>
                    </CardContent>
                    <CardFooter className="mt-auto shrink-0 border-t border-border p-4">
                      <Button size="sm" className="w-full gap-1.5" asChild>
                        <Link href={`/experts/${expert.id}`}>
                          <Video className="size-4" />
                          Book Consultation
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
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
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full border border-border bg-card p-2 shadow-md transition-colors hover:bg-muted md:-translate-x-4"
              >
                <ChevronLeft className="size-5 text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Next experts"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full border border-border bg-card p-2 shadow-md transition-colors hover:bg-muted md:translate-x-4"
              >
                <ChevronRight className="size-5 text-foreground" />
              </button>
            </>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {filtered.length} expert{filtered.length !== 1 ? "s" : ""} — scroll or use arrows
          </p>
        )}
      </div>
    </section>
  )
}
