"use client"

import Image from "next/image"
import { ShieldCheck, Users, LayoutGrid, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

const benefits = [
  {
    title: "Verified Experts",
    desc: "Only the most trusted and qualified mentors make our platform — each one selected with care and precision.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Sessions",
    desc: "Connect anytime through video, audio, or chat, and get instant support whenever you need it.",
    icon: Users,
  },
  {
    title: "Diverse Categories",
    desc: "Expert guidance across every skill and interest, helping you learn faster, grow smarter, and reach your next milestone.",
    icon: LayoutGrid,
  },
  {
    title: "Affordable Plans",
    desc: "Experience premium-level mentoring at a budget-friendly cost, designed to make expert guidance accessible to everyone.",
    icon: Wallet,
  },
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
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
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
              — Benefits —
            </p>
            <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-left">
              Why Choose Us
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className={cn(
                      "group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300",
                      "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                    )}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5 dark:text-primary" />
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
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
