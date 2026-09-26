"use client"

import Link from "next/link"
import { ArrowRight, BadgeCheck, Lock, Mail, MessageCircle, UserPlus, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

const POINTS = [
  { icon: BadgeCheck, text: "Verified experts" },
  { icon: Video, text: "Private 1:1 video" },
  { icon: Lock, text: "Secure payment" },
]

export function FinalCta() {
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")

  return (
    <section className="pb-16 pt-4 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#071427] px-6 py-12 text-white shadow-2xl sm:px-12 sm:py-16">
          <svg className="absolute inset-0 -z-10 size-full opacity-[0.07]" aria-hidden>
            <defs>
              <pattern id="cta-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M36 0H0V36" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
          <div className="animate-hero-float pointer-events-none absolute -right-20 -top-20 -z-10 size-80 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="animate-hero-float-slow pointer-events-none absolute -bottom-24 -left-10 -z-10 size-80 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Ready to talk to the{" "}
                <span className="bg-linear-to-r from-sky-300 to-emerald-200 bg-clip-text text-transparent">
                  right expert?
                </span>
              </h2>
              <p className="mt-4 max-w-lg text-base text-slate-300">
                Book a private video session today, or join as an expert and start receiving bookings.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {POINTS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-sm text-slate-200">
                    <Icon className="size-4 text-emerald-300" />
                    {text}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" className="rounded-full bg-white text-slate-950 hover:bg-slate-100" asChild>
                  <Link href="/experts">
                    Find an expert
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                {!isExpert && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <Link href="/become-an-expert">
                      Become an expert
                      <UserPlus className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <p className="text-lg font-semibold">Need help choosing?</p>
              <p className="mt-1 text-sm text-slate-400">
                Tell us your problem — we&apos;ll point you to the right expert.
              </p>
              <div className="mt-5 grid gap-3">
                {wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <MessageCircle className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">Chat on WhatsApp</span>
                      <span className="block text-xs text-slate-400">Quick replies from our team</span>
                    </span>
                    <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </a>
                ) : null}
                <Link
                  href="/contact"
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-colors hover:border-sky-400/40 hover:bg-sky-400/10"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                    <Mail className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">Send us a message</span>
                    <span className="block text-xs text-slate-400">Use the contact form</span>
                  </span>
                  <ArrowRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
