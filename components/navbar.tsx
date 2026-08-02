"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Menu, Moon, Sun, User, LayoutDashboard, LogOut, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { logoutRequest } from "@/lib/auth-api"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/experts", label: "Find Experts" },
  { href: "/become-an-expert", label: "Become Expert" },
  { href: "/contact", label: "Contact" },
] as const

function Navbar({ className, ...props }: React.ComponentProps<"header">) {
  const { resolvedTheme, setTheme } = useTheme()
  const { isLoggedIn, logout, user, token } = useAuth()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])


  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className
      )}
      {...props}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg flex gap-1 items-center font-semibold text-foreground no-underline rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image width={50} height={50} src="/logopng.png" alt="Expert" />
          Meet Expert
        </Link>
        <div className="hidden items-center gap-1 sm:flex sm:gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <span className="relative flex size-4 items-center justify-center">
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
          </Button>
          {isLoggedIn && user ? (
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <User className="size-4" />
                <span className="ml-1.5">{user.name.length > 7 ? user.name.slice(0, 7) + "..." : user.name || "Account"}</span>
              </Button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 min-w-40 rounded-lg border border-border bg-popover py-1 shadow-md"
                  role="menu"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="size-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background text-left"
                    role="menuitem"
                    onClick={async () => {
                      if (token) {
                        try {
                          await logoutRequest(token)
                        } catch {
                          // ignore
                        }
                      }
                      logout()
                      setMenuOpen(false)
                      router.push("/")
                    }}
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push("/login")}>

              Login
              <LogIn className="size-4" />
            </Button>
          )}
        </div>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {mobileOpen && (
        <div className="border-t border-border bg-background sm:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                <span className="ml-2">Theme</span>
              </Button>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    Profile
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    Dashboard
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      if (token) {
                        try {
                          await logoutRequest(token)
                        } catch {
                          // ignore
                        }
                      }
                      logout()
                      setMobileOpen(false)
                      router.push("/")
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false)
                    router.push("/login")
                  }}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export { Navbar }
