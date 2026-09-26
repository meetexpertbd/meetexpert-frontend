"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, MapPin, Mic, Search, Video, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"

function SearchMock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
        <Search className="size-3.5 text-primary" />
        Land dispute lawyer…
      </div>
      {["Advocate · Land law", "Legal consultant"].map((t, i) => (
        <div key={t} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
          <span className={cn("size-6 rounded-full", i === 0 ? "bg-primary/30" : "bg-amber-400/40")} />
          <span className="h-2 flex-1 rounded-full bg-muted" />
          <span className="text-[10px] font-medium text-muted-foreground">{t}</span>
        </div>
      ))}
    </div>
  )
}

function SlotMock() {
  const slots = ["10:00", "11:30", "2:00", "4:30", "6:00", "7:30"]
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((s, i) => (
        <span
          key={s}
          className={cn(
            "rounded-lg border py-2 text-center text-xs font-medium",
            i === 4
              ? "border-amber-500 bg-amber-500 text-amber-950 shadow-sm shadow-amber-500/30"
              : "border-border bg-background text-muted-foreground"
          )}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

function VideoMock() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-900 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex aspect-video items-center justify-center rounded-md bg-linear-to-br from-sky-500/40 to-indigo-500/40">
          <span className="size-6 rounded-full bg-white/70" />
        </div>
        <div className="flex aspect-video items-center justify-center rounded-md bg-linear-to-br from-emerald-500/40 to-teal-500/40">
          <span className="size-6 rounded-full bg-white/70" />
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white">
          <Mic className="size-3" />
        </span>
        <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-white">
          <Video className="size-3" />
        </span>
        <span className="h-6 w-10 rounded-full bg-red-500" />
      </div>
    </div>
  )
}

const steps = [
  {
    title: "Find an expert",
    bn: "এক্সপার্ট খুঁজুন",
    desc: "Browse by category or search by your problem.",
    icon: Search,
    accent: "bg-primary text-primary-foreground",
    Mock: SearchMock,
  },
  {
    title: "Book a time slot",
    bn: "সময় বুক করুন",
    desc: "Pick an open slot and pay securely online.",
    icon: CalendarCheck,
    accent: "bg-amber-500 text-amber-950",
    Mock: SlotMock,
  },
  {
    title: "Join the video call",
    bn: "ভিডিও কলে যুক্ত হন",
    desc: "Meet privately and get clear, actionable advice.",
    icon: Video,
    accent: "bg-emerald-500 text-white",
    Mock: VideoMock,
  },
]

const benefits = [
  { text: "Answers in minutes", icon: Clock },
  { text: "Affordable expert advice", icon: Wallet },
  { text: "No travel required", icon: MapPin },
]

function HowItWork() {
  return (
    <section id="how-it-works" className="relative isolate overflow-hidden bg-muted/30 py-16 sm:py-20 lg:py-24">
      <svg className="pointer-events-none absolute inset-0 -z-10 size-full text-foreground opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="howitwork-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#howitwork-dots)" />
      </svg>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          align="center"
          eyebrow="Booking journey"
          title="Expert advice in 3 simple steps"
          description="From search to solution — no travel, no waiting rooms."
        />

        <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
          <span
            className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-primary/25 md:block"
            aria-hidden
          />
          {steps.map(({ title, bn, desc, icon: Icon, accent, Mock }, i) => (
            <li key={title} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative z-10 flex size-14 items-center justify-center rounded-2xl shadow-lg ring-8 ring-background",
                  accent
                )}
              >
                <Icon className="size-6" />
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {i + 1}
                </span>
              </span>
              <div className="mt-5 flex w-full flex-1 flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="rounded-xl bg-muted/60 p-3">
                  <Mock />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-xs font-medium text-primary">{bn}</p>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                {i === steps.length - 1 && (
                  <p className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Problem solved
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {benefits.map(({ text, icon: BenefitIcon }) => (
              <span
                key={text}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                <BenefitIcon className="size-4 shrink-0 text-primary" />
                {text}
              </span>
            ))}
          </div>
          <Button size="lg" className="rounded-full" asChild>
            <Link href="/experts">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HowItWork
