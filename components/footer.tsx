"use client"

import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button, Input } from "./ui"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/experts", label: "Experts" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const productLinks = [
  { href: "/experts", label: "Find an Expert" },
  { href: "/become-an-expert", label: "Become an Expert" },
  { href: "/experts#categories", label: "Categories" },
  { href: "/contact", label: "Help & Support" },
]

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
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm text-muted-foreground transition-colors hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
        className
      )}
    >
      {children}
    </Link>
  )
}

function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  const { user } = useAuth()
  const isExpert = user?.user_type === "expert"
  const visibleProductLinks = productLinks.filter(
    (link) => !(isExpert && link.href === "/become-an-expert")
  )

  return (
    <footer
      className={cn(
        "border-t border-border bg-muted/30",
        className
      )}
      {...props}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            >
              <Image src="/logopng.png" alt="" width={36} height={36} className="size-9" />
              <span className="font-semibold">Meet Expert</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Book verified professionals for instant video consultation. Lawyers, advisors, scholars — one platform.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {visibleProductLinks.map(({ href, label }) => (
                <li key={href}>
                  <FooterLink href={href}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Social</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <FooterLink className="flex items-center gap-2" href="https://www.facebook.com/expert.com">
                <Facebook className="size-4" />
                Facebook
                </FooterLink>
              </li>
              <li>
                  <FooterLink className="flex items-center gap-2" href="https://www.twitter.com/expert.com">
                <Twitter className="size-4" />
                Twitter</FooterLink>
              </li>
              <li>
                <FooterLink className="flex items-center gap-2" href="https://www.instagram.com/expert.com">
                <Instagram className="size-4" />
                Instagram</FooterLink>
              </li>
            </ul>
            <div className="flex items-center gap-2">
              <Input type="email" placeholder="Enter your email" className="mt-4" />
              <Button type="submit" className="mt-4 text-xs">Subscribe
              </Button>
            </div>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Meet Expert. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {legalLinks.map(({ href, label }) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
