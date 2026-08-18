"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ExpertCard } from "@/components/expert-card"
import { useGet } from "@/hooks/use-get"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { FALLBACK_EXPERTS, asExpertList, mapExpertToItem } from "@/lib/experts-data"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { CATEGORIES_GRID } from "@/lib/expert-categories"
import { cn } from "@/lib/utils"

type SortOption = "experience" | "name"

function ExpertsPageInner() {
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState(searchParams.get("q") ?? "")
  const [categoryId, setCategoryId] = React.useState<number | null>(() => {
    const raw = searchParams.get("category_id")
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) ? n : null
  })
  const [sortBy, setSortBy] = React.useState<SortOption>("experience")
  const { categories } = useTaxonomy()

  const listUrl = React.useMemo(() => {
    const q = new URLSearchParams()
    q.set("per_page", "100")
    if (categoryId != null) q.set("category_id", String(categoryId))
    return `${EXPERTS_API_URL}?${q.toString()}`
  }, [categoryId])

  const { data, isLoading } = useGet<ApiEnvelope<ExpertEntity[]>>(listUrl)

  const experts = React.useMemo(() => {
    const list = asExpertList(data?.data).map(mapExpertToItem)
    return list.length > 0 ? list : FALLBACK_EXPERTS
  }, [data])

  const categoryChips =
    categories.length > 0
      ? categories
      : CATEGORIES_GRID.map((c, i) => ({ id: -(i + 1), name: c.label }))

  const filtered = React.useMemo(() => {
    let list = experts.filter((e) => {
      const q = search.trim().toLowerCase()
      const matchQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.headline.toLowerCase().includes(q) ||
        e.bio.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
      const matchCat =
        categoryId == null ||
        e.categoryId === categoryId ||
        (categoryId < 0 && e.category === categoryChips.find((c) => c.id === categoryId)?.name)
      return matchQ && matchCat
    })
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return b.yearsExperience - a.yearsExperience
    })
    return list
  }, [experts, search, sortBy, categoryId, categoryChips])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Find an Expert</h1>
          <p className="mt-1 text-muted-foreground">
            Book a private video session with reviewed professionals.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search lawyers, study abroad experts, career mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              {(["experience", "name"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={categoryId == null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryId(null)}
            >
              All
            </Badge>
            {categoryChips.map((cat) => (
              <Badge
                key={cat.id}
                variant={categoryId === cat.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading && asExpertList(data?.data).length === 0 ? (
          <ProgressLoaderScreen label="Loading experts…" />
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {filtered.length} expert{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <p className="font-medium">No experts match your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearch("")
                    setCategoryId(null)
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ExpertsPage() {
  return (
    <React.Suspense fallback={<ProgressLoaderScreen label="Loading experts…" />}>
      <ExpertsPageInner />
    </React.Suspense>
  )
}
