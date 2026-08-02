"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { fetchProfile, toAuthUser } from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setUser = useAuthStore((s) => s.setUser)

  React.useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login")
    }
  }, [isHydrated, token, router])

  React.useEffect(() => {
    if (!isHydrated || !token) return
    void fetchProfile(token)
      .then((user) => {
        setUser(toAuthUser(user))
      })
      .catch(() => {})
  }, [isHydrated, token, setUser])

  React.useEffect(() => {
    if (!isHydrated || !token) return
    if (user?.user_type !== "expert" && pathname === "/dashboard") {
      router.replace("/dashboard/bookings")
    }
  }, [isHydrated, token, user?.user_type, pathname, router])

  if (!isHydrated || !token) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-14">
      <DashboardSidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  )
}
