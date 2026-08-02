"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarClock,
  MessageCircle,
  FileText,
  Star,
  FileStack,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  User,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { logoutRequest } from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  roles?: Array<"user" | "expert">
}

type NavSection = {
  label: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: "Main",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["expert"],
      },
      {
        href: "/dashboard/mentees",
        label: "Mentees",
        icon: Users,
        roles: ["expert"],
      },
    ],
  },
  {
    label: "Appointments",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
      {
        href: "/dashboard/scheduled",
        label: "Scheduled Timings",
        icon: CalendarClock,
        roles: ["expert"],
      },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, badge: 3 },
      {
        href: "/dashboard/invoices",
        label: "Invoices",
        icon: FileText,
        roles: ["expert"],
      },
      { href: "/dashboard/reviews", label: "Reviews", icon: Star },
      {
        href: "/dashboard/blogs",
        label: "Blogs",
        icon: FileStack,
        roles: ["expert"],
      },
      {
        href: "/dashboard/application",
        label: "Application",
        icon: ClipboardList,
        roles: ["expert"],
      },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
]

const USER_HOME = "/dashboard/bookings"

const USER_ALLOWED = new Set([
  "/dashboard/bookings",
  "/dashboard/messages",
  "/dashboard/reviews",
  "/dashboard/settings",
])
export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const userType = user?.user_type === "expert" ? "expert" : "user"
  const displayName = user?.name ?? "Account"
  const displayEmail = user?.email ?? ""
  const avatarUrl = user?.avatar ?? null

  const sections = React.useMemo(() => {
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (userType === "expert") return true
          if (item.roles?.includes("expert") && !item.roles.includes("user")) {
            return false
          }
          return USER_ALLOWED.has(item.href)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [userType])

  React.useEffect(() => {
    if (userType !== "user") return
    if (pathname === "/dashboard" || !USER_ALLOWED.has(pathname)) {
      router.replace(USER_HOME)
    }
  }, [pathname, userType, router])

  async function handleLogout() {
    setOpen(false)
    const token = useAuthStore.getState().token
    if (token) {
      try {
        await logoutRequest(token)
      } catch {
        // clear local session anyway
      }
    }
    logout()
    router.replace("/login")
  }

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-20 z-50 flex size-10 items-center justify-center rounded-lg border border-border bg-card shadow lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-border bg-muted/50 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-end border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="flex flex-col items-center border-b border-border pb-4">
            <div className="relative">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted ring-2 ring-primary/20">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      e.currentTarget.parentElement
                        ?.querySelector("[data-avatar-fallback]")
                        ?.classList.remove("hidden")
                    }}
                  />
                ) : null}
                <User
                  data-avatar-fallback
                  className={cn(
                    "size-7 text-muted-foreground",
                    avatarUrl && "hidden"
                  )}
                />
              </div>
            </div>
            <p className="mt-2 font-semibold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {displayEmail || (userType === "expert" ? "Expert" : "User")}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </button>
              <Link
                href="/dashboard/settings"
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                aria-label="Settings"
                onClick={() => setOpen(false)}
              >
                <Settings className="size-4" />
              </Link>
            </div>
          </div>

          <nav className="mt-4 flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            <div>
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Session
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4 shrink-0" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}
