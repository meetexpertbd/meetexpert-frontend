"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Video, UserPlus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"


const trustStats = [
  { value: "5000+", label: "Consultations" },
  { value: "200+", label: "Verified Experts" },
  { value: "10+", label: "Countries" },
]



const sliderItems = [
  {
    type: "expert" as const,
    name: "Adv. Rahman",
    role: "Lawyer",
    rating: 4.9,
    sessions: 200,
    duration: "30 min",
    price: "800 BDT",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
  },
  {
    type: "expert" as const,
    name: "Dr. Fatima",
    role: "Study Abroad Advisor",
    rating: 4.8,
    sessions: 150,
    duration: "45 min",
    price: "1,200 BDT",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    type: "mockup" as const,
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
  },
]

function HeroSlider() {
  const [index, setIndex] = React.useState(0)
  const item = sliderItems[index]

  React.useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % sliderItems.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-xl">
      <div className="aspect-4/3 w-full sm:aspect-square sm:max-w-md">
        {item.type === "expert" ? (
          <div className="relative flex h-full w-full flex-col justify-end p-4">
            <Image
              width={300}
              height={300}
              src={item.image}
              alt={item.name}
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative rounded-xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-white/50">
                  <Image width={300} height={300} src={item.image} alt="hero" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-white/80">{item.role}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-amber-400">
                    <span>★</span> {item.rating} · {item.sessions} sessions
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/90">
                {item.duration} | {item.price}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <Image
              width={100}
              height={100}
              src={item.image}
              alt="Video consultation"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="rounded-2xl border-4 border-white/30 bg-black/50 px-6 py-4 backdrop-blur-sm">
                <Video className="mx-auto size-12 text-white" />
                <p className="mt-2 text-sm font-medium text-white">Video Consultation</p>
                <p className="text-xs text-white/80">Secure & private</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {sliderItems.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"

  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div className="space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="gap-1.5">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              12 Experts Available Now
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Talk to Verified Experts Instantly
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
              Book lawyers, study abroad advisors, and scholars for secure video consultations.
              Get professional advice in minutes from anywhere.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/experts">
                Find an Expert
                <Search className="size-4" />
                </Link>
              </Button>
              {!isExpert && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/become-an-expert">Become an Expert
                  <UserPlus className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {trustStats.map(({ value, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-green-600" />
                  <strong className="text-foreground">{value}</strong> {label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <HeroSlider />
          </div>
        </div>

       
      </div>
    </section>
  )
}
