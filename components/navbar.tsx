"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ArrowRight, ChevronDown, Menu, Moon, Sun, User, LayoutDashboard, LogOut, X, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { logoutRequest } from "@/lib/auth-api"
import { CATEGORY_PAGES } from "@/lib/category-pages"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/experts", label: "Find Experts" },
  { href: "/become-an-expert", label: "Become Expert" },
  { href: "/contact", label: "Contact" },
] as const

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

function Navbar({ className, ...props }: React.ComponentProps<"header">) {
  const { resolvedTheme, setTheme } = useTheme()
  const { isLoggedIn, logout, user, token } = useAuth()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [categoriesOpen, setCategoriesOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const categoriesRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const categoryActive = CATEGORY_PAGES.some((p) => isActivePath(pathname, p.href))
  const isExpert = user?.user_type === "expert"
  const visibleNavLinks = navLinks.filter(
    (link) => !(isExpert && link.href === "/become-an-expert")
  )
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

  React.useEffect(() => {
    if (!categoriesOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node))
        setCategoriesOpen(false)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setCategoriesOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [categoriesOpen])

  React.useEffect(() => {
    setCategoriesOpen(false)
    setMobileOpen(false)
  }, [pathname])


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
        <div className="hidden items-center gap-1 md:flex">
          {visibleNavLinks.map(({ href, label }) => (
            <React.Fragment key={href}>
              <Link
                href={href}
                aria-current={isActivePath(pathname, href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActivePath(pathname, href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
              {href === "/" && (
                <div className="relative" ref={categoriesRef}>
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen((o) => !o)}
                    aria-expanded={categoriesOpen}
                    aria-haspopup="true"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      categoryActive || categoriesOpen ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Categories
                    <ChevronDown className={cn("size-4 transition-transform", categoriesOpen && "rotate-180")} />
                  </button>
                  {categoriesOpen && (
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-lg" role="menu">
                      {CATEGORY_PAGES.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          role="menuitem"
                          onClick={() => setCategoriesOpen(false)}
                          className={cn(
                            "flex items-start gap-3 rounded-lg p-2.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                            isActivePath(pathname, p.href) && "bg-muted"
                          )}
                        >
                          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", p.iconClass)}>
                            <p.icon className="size-4.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-popover-foreground">
                              {p.label} <span className="font-normal text-muted-foreground">· {p.bn}</span>
                            </span>
                            <span className="block text-xs text-muted-foreground">{p.description}</span>
                          </span>
                        </Link>
                      ))}
                      <Link
                        href="/experts"
                        role="menuitem"
                        onClick={() => setCategoriesOpen(false)}
                        className="mt-1 flex items-center justify-between rounded-lg border-t border-border px-2.5 pb-1.5 pt-2.5 text-sm font-medium text-primary outline-none hover:underline"
                      >
                        Browse all experts
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="hidden items-center gap-2 md:flex">
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
                className="gap-2 pl-1"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <UserAvatar name={user.name} src={user.avatar} size="xs" />
                <span className="max-w-24 truncate">{user.name || "Account"}</span>
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
        <div className="flex items-center gap-1.5 md:hidden">
          {isLoggedIn && user ? (
            <UserAvatar name={user.name} src={user.avatar} size="xs" />
          ) : null}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-border bg-background md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {visibleNavLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActivePath(pathname, href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActivePath(pathname, href) && "bg-muted"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Categories
            </p>
            {CATEGORY_PAGES.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  isActivePath(pathname, p.href) && "bg-muted"
                )}
              >
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", p.iconClass)}>
                  <p.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{p.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.description}</span>
                </span>
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
              {isLoggedIn && user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1">
                    <UserAvatar name={user.name} src={user.avatar} size="sm" />
                    <span className="truncate text-sm font-medium">{user.name}</span>
                  </div>
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
