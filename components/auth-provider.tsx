"use client"

import * as React from "react"
import { useAuthStore } from "@/store/auth-store"

function AuthProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

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
