"use client"

import * as React from "react"
import { fetchProfile, resolveAvatarUrl, toAuthUser } from "@/lib/auth-api"
import { fetchExpertDashboard } from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"

function AuthProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setUser = useAuthStore((s) => s.setUser)

  React.useEffect(() => {
    if (!isHydrated || !token) return
    let cancelled = false

    async function hydrateUser() {
      const current = useAuthStore.getState().user
      try {
        if (current?.user_type === "expert") {
          const res = await fetchExpertDashboard(token!)
          if (cancelled) return
          const profile = res.data.profile
          setUser({
            id: current.id,
            name: profile.name || current.name,
            email: current.email,
            user_type: current.user_type,
            avatar: resolveAvatarUrl(profile.avatar_url) ?? current.avatar ?? null,
          })
          return
        }

        const user = await fetchProfile(token!)
        if (!cancelled) setUser(toAuthUser(user))
      } catch {
        // keep persisted session
      }
    }

    void hydrateUser()
    return () => {
      cancelled = true
    }
  }, [isHydrated, token, setUser])

  return <>{children}</>
}

function useAuth() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const email = useAuthStore((s) => s.email)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const logout = useAuthStore((s) => s.logout)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUser = useAuthStore((s) => s.setUser)
  const setEmail = useAuthStore((s) => s.setEmail)

  return {
    token,
    user,
    email,
    isHydrated,
    isLoggedIn: Boolean(token),
    logout,
    setAuth,
    setUser,
    setEmail,
  }
}

export { AuthProvider, useAuth }
