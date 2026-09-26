"use client"

import Image from "next/image"
import { BadgeCheck, CalendarClock, ShieldCheck, Star, Video, Wallet } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import { cn } from "@/lib/utils"

const benefits = [
  { title: "Verified professionals", desc: "Experts go through application review before they are listed.", icon: ShieldCheck, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { title: "Private 1-to-1 video", desc: "Meet in a secure session room — just you and the expert.", icon: Video, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { title: "Transparent pricing", desc: "See the session fee on the profile before you book.", icon: Wallet, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { title: "Flexible scheduling", desc: "Pick an open slot that fits your day.", icon: CalendarClock, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { title: "Real user reviews", desc: "Read feedback from people who booked the same expert.", icon: Star, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { title: "Listed with care", desc: "Identity, credentials, and experience are part of our review process.", icon: BadgeCheck, tone: "bg-primary/10 text-primary" },
]

function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why MeetExpert"
          title={
            <>
              Not another marketplace.
              <br className="hidden sm:block" /> <span className="text-primary">A better way to get expert advice.</span>
            </>
          }
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <div className="relative min-h-72 overflow-hidden rounded-3xl bg-slate-900 md:col-span-2 lg:row-span-2">
            <Image
              src="/howitwork.jpg"
              alt="User in video consultation with an expert"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Live 1:1 consultation
              </p>
              <p className="mt-3 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">
                Talk face-to-face with a real expert — from anywhere.
              </p>
              <p className="mt-2 text-sm text-white/75">ঘরে বসেই বিশেষজ্ঞের পরামর্শ নিন।</p>
            </div>
          </div>

          {benefits.slice(0, 4).map(({ title, desc, icon: Icon, tone }) => (
            <div
              key={title}
              className="group rounded-3xl border border-border/70 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className={cn("flex size-11 items-center justify-center rounded-xl", tone)}>
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {benefits.slice(4).map(({ title, desc, icon: Icon, tone }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-3xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30"
            >
              <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}>
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
