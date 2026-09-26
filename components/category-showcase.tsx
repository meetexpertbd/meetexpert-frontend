import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { CATEGORY_PAGES } from "@/lib/category-pages"
import { cn } from "@/lib/utils"

const SHOWCASE: Record<
  string,
  { images: string[]; alt: string; accent: string; chip: string; topics: string[] }
> = {
  "/lawyer": {
    images: ["https://images.unsplash.com/photo-1764113697577-b5899b9a339d?w=800&h=1000&fit=crop"],
    alt: "Statue of Lady Justice holding scales",
    accent: "text-yellow-300",
    chip: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
    topics: ["Land & Property", "Family", "Business", "Criminal"],
  },
  "/study-abroad": {
    images: ["https://images.unsplash.com/photo-1747509228690-8f1fef36d0bf?w=800&h=1000&fit=crop"],
    alt: "Graduates throwing their caps in the air",
    accent: "text-sky-300",
    chip: "border-sky-300/30 bg-sky-300/10 text-sky-100",
    topics: ["Admission", "Scholarship", "IELTS / PTE", "Student visa"],
  },
  "/religious-scholar": {
    images: [
      "https://images.unsplash.com/photo-1589023025635-addd8d0392f8?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1705864821171-63fc75ee6c0e?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1764013649666-2405bb62b62f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1570000651176-f1fce849bf1d?w=400&h=500&fit=crop",
    ],
    alt: "Mosque, church, Hindu altar and Buddhist shrine",
    accent: "text-amber-300",
    chip: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    topics: ["Islam", "Christianity", "Hinduism", "Buddhism"],
  },
}

export function CategoryShowcase() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Explore by specialty"
          title="Expert help for life's big decisions"
          description="আইন, বিদেশে পড়াশোনা বা ধর্মীয় বিষয়ে, সঠিক এক্সপার্টের সাথে ব্যক্তিগতভাবে কথা বলুন।"
          action={
            <Link
              href="/experts"
              className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Browse all experts
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CATEGORY_PAGES.map((page) => {
            const s = SHOWCASE[page.href]
            if (!s) return null
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group relative isolate flex min-h-104 flex-col justify-end overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className={cn("absolute inset-0 -z-10 grid", s.images.length > 1 && "grid-cols-2 grid-rows-2")}>
                  {s.images.map((src, i) => (
                    <div key={src} className="relative overflow-hidden">
                      <Image
                        src={src}
                        alt={i === 0 ? s.alt : ""}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950 via-slate-950/60 to-slate-950/5" />

                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <page.icon className={cn("size-6", s.accent)} />
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight">{page.label}</h3>
                <p className={cn("text-sm font-medium", s.accent)}>{page.bn}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{page.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.topics.map((t) => (
                    <span key={t} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", s.chip)}>
                      {t}
                    </span>
                  ))}
                </div>

                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                  Explore {page.label.toLowerCase()}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
