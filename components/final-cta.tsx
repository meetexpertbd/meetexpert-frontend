"use client"

import Link from "next/link"
import { Mail, MessageCircle, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

export function FinalCta() {
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground shadow-lg sm:px-12 sm:py-14">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to talk to the right expert?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/85 sm:text-base">
            Book a private video session, or join as an expert and start receiving bookings.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/experts">
                Find an Expert
                <Search className="size-4" />
              </Link>
            </Button>
            {!isExpert && (
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/become-an-expert">
                  Become an Expert
                  <UserPlus className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm">
          <p className="font-semibold text-foreground">Need help? We&apos;re here.</p>
          <p className="mt-1 text-sm text-muted-foreground">WhatsApp, email, or the contact form.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {wa ? (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" asChild>
              <Link href="/contact">
                <Mail className="size-4" />
                Contact
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
