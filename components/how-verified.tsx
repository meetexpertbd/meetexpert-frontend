"use client"

import { Award, BadgeCheck, Briefcase, Check, Fingerprint, ShieldCheck, Star } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"

const STEPS = [
  { Icon: Fingerprint, title: "Identity", desc: "Government ID and profile details are reviewed during application." },
  { Icon: Award, title: "Qualification", desc: "Certificates and professional credentials are checked by the team." },
  { Icon: Briefcase, title: "Experience", desc: "Work history and stated expertise are screened before listing." },
  { Icon: Star, title: "Platform review", desc: "Conduct and quality standards are part of ongoing listing review." },
]

export function HowVerified() {
  return (
    <section className="relative isolate overflow-hidden bg-[#071427] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 size-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 -z-10 size-96 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Our review process"
              title={
                <>
                  Every expert is{" "}
                  <span className="bg-linear-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
                    carefully reviewed
                  </span>
                </>
              }
              description="Experts apply, submit credentials, and go through platform review before they appear in search."
            />
            <ol className="relative mt-10 space-y-6">
              <span className="absolute bottom-6 left-5 top-6 w-px bg-linear-to-b from-emerald-400/60 via-sky-400/40 to-transparent" aria-hidden />
              {STEPS.map(({ Icon, title, desc }, i) => (
                <li key={title} className="relative flex gap-4">
                  <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0c1f3a] text-emerald-300">
                    <Icon className="size-5" />
                  </span>
                  <div className="pt-1">
                    <p className="font-semibold">
                      <span className="mr-2 text-xs font-medium text-slate-500">0{i + 1}</span>
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-emerald-400/20 to-sky-500/20 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              <div className="flex items-center gap-4">
                <div className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-sky-500 text-white shadow-lg shadow-emerald-500/30">
                  <ShieldCheck className="size-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Verification checklist</p>
                  <p className="text-sm text-slate-400">Completed before an expert goes live</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {STEPS.map(({ title }) => (
                  <li
                    key={title}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-sm font-medium">{title} check</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      <Check className="size-3.5" />
                      Passed
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                <BadgeCheck className="size-5 shrink-0" />
                Only approved experts receive the verified badge.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
