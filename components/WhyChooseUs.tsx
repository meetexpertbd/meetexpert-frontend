"use client"

import Image from "next/image"
import {
  BadgeCheck,
  CalendarClock,
  ShieldCheck,
  Star,
  Video,
  Wallet,
} from "lucide-react"
import { cn } from "@/lib/utils"

const benefits = [
  { title: "Verified professionals", desc: "Experts go through application review before they are listed.", icon: ShieldCheck },
  { title: "Private 1-to-1 video", desc: "Meet in a secure session room — just you and the expert.", icon: Video },
  { title: "Transparent pricing", desc: "See the session fee on the profile before you book.", icon: Wallet },
  { title: "Flexible scheduling", desc: "Pick an open slot that fits your day.", icon: CalendarClock },
  { title: "Real user reviews", desc: "Read feedback from people who booked the same expert.", icon: Star },
  { title: "Listed with care", desc: "Identity, credentials, and experience are part of our review process.", icon: BadgeCheck },
]

function WhyChooseUs() {
  return (
    <section
      className={cn(
        "relative overflow-hidden py-16 sm:py-20 lg:py-24",
        "bg-linear-to-b from-primary/5 via-background to-primary/[0.07]"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border/60">
              <Image
                src="/howitwork.jpg"
                alt="User in video consultation with an expert"
                width={600}
                height={400}
                className="aspect-4/3 w-full object-cover"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-center text-sm font-medium text-primary lg:text-left">
              — Why MeetExpert —
            </p>
            <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-left">
              Not another marketplace. A better way to get expert advice.
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-primary-foreground">
                      <Icon className="size-5 dark:text-primary" />
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
