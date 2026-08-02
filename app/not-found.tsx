"use client"

import Link from "next/link"
import { Home, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
            4
            <span className="inline-block animate-bounce animation-duration-[2s] animation-delay-[0.2s]">
              0
            </span>
            <span className="inline-block animate-bounce animation-duration-[2s] animation-delay-[0.4s]">
              4
            </span>
          </h1>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex justify-center py-8">
            <div className="relative">
              <div className="absolute -left-4 -top-4 size-16 rounded-full bg-primary/20 animate-pulse animation-duration-[3s]" />
              <div className="absolute -bottom-4 -right-4 size-12 rounded-full bg-primary/30 animate-pulse animation-duration-[2s] animation-delay-[0.5s]" />
              <div className="relative z-10 flex size-32 items-center justify-center rounded-full bg-muted">
                <Search className="size-16 text-muted-foreground animate-in zoom-in-50 duration-1000 delay-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
            <Button asChild size="lg" className="gap-2 animate-in fade-in slide-in-from-left-4 duration-700 delay-700">
              <Link href="/">
                <Home className="size-4" />
                Go Home
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="gap-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-700"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
          </div>

          <div className="pt-8 animate-in fade-in duration-1000 delay-1000">
            <p className="mb-4 text-sm text-muted-foreground">
              You might be looking for:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/experts">Experts</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about">About</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
