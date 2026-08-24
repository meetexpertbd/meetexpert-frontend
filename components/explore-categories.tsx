"use client"

import Link from "next/link"
import type { ElementType } from "react"
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop,
  Scale,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { useTaxonomy } from "@/hooks/use-taxonomy"

const ICON_BY_NAME: Record<string, ElementType> = {
  Legal: Scale,
  Law: Scale,
  Education: GraduationCap,
  "Study Abroad": GraduationCap,
  Career: Briefcase,
  Business: Briefcase,
  Health: HeartPulse,
  Religion: Sparkles,
  Technology: Laptop,
}

export function ExploreCategories() {
  const { categories, isLoading } = useTaxonomy()

  const cards = categories.map((c) => ({
    id: String(c.id),
    name: c.name,
    desc: c.subcategories.slice(0, 3).map((s) => s.name).join(", ") || "Browse verified experts",
    href: `/experts?category_id=${c.id}`,
  }))

  return (
    <section id="categories" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">— Categories —</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              What can an expert help you with?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Choose a category to find the right professional for a private video session.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/experts">
              Explore all categories
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading && cards.length === 0 ? (
          <div className="mt-10 flex justify-center py-12">
            <ProgressLoader size="lg" label="Loading categories…" />
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No categories available yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = ICON_BY_NAME[card.name] ?? Landmark
              return (
                <Link
                  key={card.id}
                  href={card.href}
                  className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{card.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{card.desc}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
