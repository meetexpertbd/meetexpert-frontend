"use client"

import * as React from "react"
import { Search, CalendarCheck, Video, CheckCircle2, Clock, Wallet, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    num: 1,
    title: "Find an Expert",
    desc: "Browse by category or search",
    icon: Search,
    color: "text-primary-foreground bg-primary",
    badge: "Search",
    badgeIcon: Search,
    badgeClass: "text-primary",
  },
  {
    num: 2,
    title: "Book a Time Slot",
    desc: "Pick a time that works",
    icon: CalendarCheck,
    color: "text-amber-950 bg-amber-500",
    badge: "Booked",
    badgeIcon: CalendarCheck,
    badgeClass: "text-amber-600 dark:text-amber-400",
  },
  {
    num: 3,
    title: "Join Video Consultation",
    desc: "Get advice in minutes",
    icon: Video,
    color: "text-green-950 bg-green-500",
    isLast: true,
    badge: "Done",
    badgeIcon: CheckCircle2,
    badgeClass: "text-green-600 dark:text-green-400",
  },
]

const benefits = [
  { text: "Get answers in minutes", icon: Clock },
  { text: "Affordable expert advice", icon: Wallet },
  { text: "No travel required", icon: MapPin },
]

function ConnectorLine({ delay = 0, vertical = false }: { delay?: number; vertical?: boolean }) {
  const length = vertical ? 32 : 48
  return (
    <svg
      className="shrink-0 text-border"
      width={vertical ? 2 : 56}
      height={vertical ? 32 : 2}
      viewBox={vertical ? `0 0 2 ${length}` : `0 0 ${length} 2`}
      fill="none"
      aria-hidden
    >
      <line
        x1={vertical ? 1 : 0}
        y1={vertical ? 0 : 1}
        x2={vertical ? 1 : length}
        y2={vertical ? length : 1}
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={length}
        strokeDashoffset={length}
        className="animate-flow-line"
        style={{
          animationDelay: `${delay}ms`,
          animationFillMode: "forwards",
        }}
      />
    </svg>
  )
}

const DOT_SIZE = 1.5
const DOT_GAP = 24

function DottedBg() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-foreground opacity-[0.08] dark:opacity-[0.12]"
      aria-hidden
    >
      <defs>
        <pattern
          id="howitwork-dots"
          width={DOT_GAP}
          height={DOT_GAP}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={DOT_GAP / 2} cy={DOT_GAP / 2} r={DOT_SIZE} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#howitwork-dots)" />
    </svg>
  )
}

function HowItWork() {
  return (
    <section className="relative py-16 sm:py-20">
      <DottedBg />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-sm font-medium text-primary">
          — Booking Journey —
        </p>
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>

        <div >
         

          <div className="flex flex-col">
            <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between">
              {steps.map((step, i) => {
                const Icon = step.icon
                const BadgeIcon = step.badgeIcon
                const isLast = step.isLast ?? i === steps.length - 1
                return (
                  <React.Fragment key={step.num}>
                    <div
                      className={cn(
                        "group flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300",
                        "hover:border-primary/30 hover:shadow-md sm:min-w-[140px] sm:flex-1",
                        isLast && "ring-2 ring-green-500/30 ring-offset-2 ring-offset-background"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={cn(
                            "flex size-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110",
                            step.color
                          )}
                        >
                          {isLast ? (
                            <CheckCircle2 className="size-6 text-white" strokeWidth={2.5} />
                          ) : (
                            <Icon className="size-6" />
                          )}
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground/60">
                          {String(step.num).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{step.desc}</p>
                      {"badge" in step && (
                        <p
                          className={cn(
                            "mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium",
                            step.badgeClass
                          )}
                        >
                          <BadgeIcon className="size-3.5 shrink-0" />
                          {step.badge}
                        </p>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden items-center py-6 sm:flex">
                        <ConnectorLine delay={(i + 1) * 200} />
                      </div>
                    )}
                    {i < steps.length - 1 && (
                      <div className="flex justify-center py-2 sm:hidden">
                        <ConnectorLine delay={(i + 1) * 200} vertical />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {benefits.map(({ text, icon: BenefitIcon }) => (
                <span
                  key={text}
                  className={cn(
                    "flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground",
                    "transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  <BenefitIcon className="size-4 shrink-0 text-primary" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWork
