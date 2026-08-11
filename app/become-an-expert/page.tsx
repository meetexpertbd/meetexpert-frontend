"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Video,
  DollarSign,
  Globe,
  Clock,
  UserPlus,
  Scale,
  GraduationCap,
  Heart,
  Briefcase,
  Cpu,
  ChevronRight,
  UserCheck,
  CalendarCheck,
  Wallet,
  CheckCircle2,
  Quote,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CATEGORIES_GRID } from "@/lib/expert-categories"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"

const WHY_ITEMS = [
  { icon: DollarSign, title: "Earn Online", desc: "Set your own consultation fee." ,iconClass: "text-white bg-amber-500" },
  { icon: Globe, title: "Reach More Clients", desc: "Connect with people from anywhere." ,iconClass: "text-white bg-blue-500" },
  { icon: Clock, title: "Flexible Schedule", desc: "Work on your own time." ,iconClass: "text-white bg-green-500" },
  { icon: Video, title: "Simple Video Consultation", desc: "Secure built-in video call system." ,iconClass: "text-white bg-purple-500" },
]

const HOW_STEPS = [
  { num: 1, title: "Create Profile", desc: "Add your expertise and experience.", icon: UserCheck ,iconClass: "text-white bg-primary" },
  { num: 2, title: "Set Your Availability", desc: "Choose time slots for consultations.", icon: CalendarCheck ,iconClass: "text-white bg-amber-500" },
  { num: 3, title: "Get Bookings", desc: "Users will book sessions with you.", icon: Wallet ,iconClass: "text-white bg-blue-500" },
  { num: 4, title: "Join Video Call & Earn", desc: "Deliver consultations and get paid.", icon: Video ,iconClass: "text-white bg-green-500" },
  { num: 3, title: "Get Bookings", desc: "Users will book sessions with you.", icon: Wallet, iconClass: "text-white bg-purple-500" },
  { num: 4, title: "Join Video Call & Earn", desc: "Deliver consultations and get paid.", icon: Video, iconClass: "text-white bg-primary" },
]

const REQUIREMENTS = [
  "Professional experience",
  "Good communication skills",
  "Reliable internet",
  "Identity verification",
]

const VERIFICATION_STEPS = ["Application Review", "Profile Verification", "Expert Approval", "Start Receiving Bookings"]

const TESTIMONIALS = [
  { quote: "This platform helped me connect with many clients.", name: "Adv. Rahman", role: "Lawyer" },
  { quote: "Flexible hours and fair earnings. Highly recommend.", name: "Dr. Fatima", role: "Study Abroad Advisor" },
  { quote: "Simple process from signup to first booking.", name: "Maulana Abdullah", role: "Islamic Scholar" },
]

const categoryIcons: Record<string, React.ElementType> = {
  Legal: Scale,
  Education: GraduationCap,
  Religion: Heart,
  Health: Heart,
  Business: Briefcase,
  Technology: Cpu,
}

export default function BecomeAnExpertPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isExpert = user?.user_type === "expert"

  React.useEffect(() => {
    if (isHydrated && isExpert) router.replace("/dashboard")
  }, [isHydrated, isExpert, router])

  if (isHydrated && isExpert) {
    return <main className="min-h-screen bg-background" />
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-6 sm:space-y-8">
              <Badge variant="secondary" className="gap-1.5">
                <UserPlus className="size-3.5" />
                Experts Recruitment
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Share Your Expertise & Earn Through Video Consultations
              </h1>
              <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
                Join our platform and connect with people who need your professional advice.
              </p>
              <Button size="lg" asChild className="gap-2">
                <Link href="/become-an-expert/apply">
                  Apply Now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=600&fit=crop"
                  alt="Expert video consultation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="rounded-2xl border-2 border-white/30 bg-black/50 p-6 backdrop-blur-sm">
                    <Video className="mx-auto size-14 text-white" />
                    <p className="mt-2 text-center text-sm font-medium text-white">Video Consultation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Benefits —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Why Become an Expert
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="border-border transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", item.iconClass)}>
                      <Icon className={cn("size-5", item.iconClass)} />
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— A–Z Coverage —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Categories We Support
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES_GRID.map((cat) => {
              const Icon = categoryIcons[cat.label] ?? Briefcase
              return (
                <Card key={cat.label} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{cat.label}</h3>
                    </div>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {cat.items.map((sub) => (
                        <li key={sub}>
                          <Badge variant="outline" className="text-xs font-normal">
                            {sub}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            + Many More Fields — add yours in the application
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Expert Journey —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", step.iconClass)}>
                    <Icon className={cn("size-6", step.iconClass)} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Step {step.num}</span>
                    <h3 className="mt-0.5 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Earnings —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Earnings Example
          </h2>
          <Card className="mx-auto mt-10 max-w-md border-border">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Session Price</span>
                  <span className="font-medium">800 BDT</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">Daily 5 sessions</span>
                  <span className="font-medium">4,000 BDT</span>
                </p>
                <p className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Monthly (20 days)</span>
                  <span className="text-lg font-semibold text-primary">80,000 BDT</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Requirements —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Expert Requirements
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {REQUIREMENTS.map((req) => (
              <span
                key={req}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm"
              >
                <CheckCircle2 className="size-4 text-primary" />
                {req}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="border-y border-border bg-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to Apply?
          </h2>
          <p className="mt-2 text-muted-foreground">
            3-step wizard: Personal Info → Expertise → Availability & Pricing
          </p>
          <Button size="lg" asChild className="mt-6 gap-2">
            <Link href="/become-an-expert/apply">
              Start Application
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Process —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Verification Process
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {VERIFICATION_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">
                  {step}
                </div>
                {i < VERIFICATION_STEPS.length - 1 && (
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-primary">— Feedback —</p>
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Expert Testimonials
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border">
                <CardContent className="p-5">
                  <Quote className="size-8 text-primary/30" />
                  <p className="mt-2 text-sm text-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-3 font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Start Your Expert Journey Today
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join verified experts and grow your reach.
          </p>
          <Button size="lg" asChild className="mt-6 gap-2">
            <Link href="/become-an-expert/apply">
              Apply Now
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
