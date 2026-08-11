"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { useGet } from "@/hooks/use-get"
import { EXPERTS_API_URL, type ExpertEntity } from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { PLACEHOLDER_AVATAR, mapExpertToItem, type ExpertItem } from "@/lib/experts-data"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { cn } from "@/lib/utils"

type SortOption = "experience" | "name"

export default function ExpertsPage() {
  const [search, setSearch] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<number | null>(null)
  const [sortBy, setSortBy] = React.useState<SortOption>("experience")
  const { categories } = useTaxonomy()

  const listUrl = React.useMemo(() => {
    const q = new URLSearchParams()
    q.set("per_page", "100")
    if (categoryId != null) q.set("category_id", String(categoryId))
    return `${EXPERTS_API_URL}?${q.toString()}`
  }, [categoryId])

  const { data, isLoading, isError, refetch } = useGet<ApiEnvelope<ExpertEntity[]>>(listUrl)

  const experts = React.useMemo(
    () => (data?.data ?? []).map(mapExpertToItem),
    [data]
  )

  const filtered = React.useMemo(() => {
    let list = experts.filter((e) => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.subcategory.toLowerCase().includes(q) ||
        e.headline.toLowerCase().includes(q) ||
        e.bio.toLowerCase().includes(q) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
      )
    })
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return b.yearsExperience - a.yearsExperience
    })
    return list
  }, [experts, search, sortBy])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Find an Expert
          </h1>
          <p className="mt-1 text-muted-foreground">
            Book verified professionals for video consultation.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, category, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort:</span>
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
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant={categoryId == null ? "default" : "outline"}
              className="cursor-pointer transition-colors hover:opacity-90"
              onClick={() => setCategoryId(null)}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={categoryId === cat.id ? "default" : "outline"}
                className="cursor-pointer transition-colors hover:opacity-90"
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <ProgressLoaderScreen label="Loading experts…" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-medium text-foreground">Could not load experts</p>
            <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
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
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                <Search className="size-12 text-muted-foreground" />
                <p className="mt-4 font-medium text-foreground">No experts match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or category.
                </p>
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

function ExpertCard({ expert }: { expert: ExpertItem }) {
  const [imgFailed, setImgFailed] = React.useState(false)
  const src = !imgFailed && expert.image ? expert.image : PLACEHOLDER_AVATAR

  React.useEffect(() => {
    setImgFailed(false)
  }, [expert.image])

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={expert.name}
          className="size-full object-cover"
          onError={() => {
            if (src !== PLACEHOLDER_AVATAR) setImgFailed(true)
          }}
        />
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" className="text-xs">
            {expert.yearsExperience}+ yrs
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2 text-xs">
          {expert.category}
        </Badge>
        <h2 className="font-semibold text-foreground">{expert.name}</h2>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
          {expert.headline || expert.subcategory}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{expert.bio}</p>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-border p-4">
        <Button size="sm" className="flex-1 gap-1.5" asChild>
          <Link href={`/experts/${expert.slug}`}>
            <Video className="size-4" />
            Book Consultation
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
