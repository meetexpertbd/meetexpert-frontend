"use client"

import { ShieldCheck } from "lucide-react"

const STEPS = [
  { num: "01", title: "Identity", desc: "Government ID and profile details are reviewed during application." },
  { num: "02", title: "Qualification", desc: "Certificates and professional credentials are checked by the team." },
  { num: "03", title: "Experience", desc: "Work history and stated expertise are screened before listing." },
  { num: "04", title: "Platform review", desc: "Conduct and quality standards are part of ongoing listing review." },
]

export function HowVerified() {
  return (
    <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="text-sm font-medium text-primary">— Our review process —</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Every expert is carefully reviewed
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Experts apply, submit credentials, and go through platform review before they appear in search.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {STEPS.map((step) => (
                <li key={step.num} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                  <p className="text-xs font-semibold text-primary">{step.num}</p>
                  <p className="mt-1 font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex justify-center">
            <div className="relative flex aspect-square w-full max-w-sm items-center justify-center rounded-3xl bg-primary/10">
              <ShieldCheck className="size-28 text-primary sm:size-36" strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
