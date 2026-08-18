"use client"

import type { ComponentProps, ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

const columns = [
  {
    title: "MeetExpert",
    links: [
      { href: "/about", label: "About" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "For clients",
    links: [
      { href: "/experts", label: "Find an Expert" },
      { href: "/#how-it-works", label: "How booking works" },
      { href: "/privacy", label: "Privacy" },
      { href: "/contact", label: "Help" },
    ],
  },
] as const

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
]

function FooterLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-muted-foreground transition-colors hover:text-foreground rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </Link>
  )
}

function Footer({ className, ...props }: ComponentProps<"footer">) {
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"

  return (
    <footer className={cn("border-t border-border bg-muted/30", className)} {...props}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-md font-semibold text-foreground">
              <Image src="/logopng.png" alt="" width={36} height={36} className="size-9" />
              Meet Expert
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Private 1-to-1 video consultations with reviewed professionals.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-foreground">For experts</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {!isExpert && (
                <li>
                  <FooterLink href="/become-an-expert">Become an Expert</FooterLink>
                </li>
              )}
              <li>
                <FooterLink href="/dashboard">Expert dashboard</FooterLink>
              </li>
              <li>
                <FooterLink href="/terms">Terms</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Reviewed professionals · © {new Date().getFullYear()} Meet Expert
          </p>
          <nav className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
