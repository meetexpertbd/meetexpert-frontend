"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser } from "@/lib/auth-api"

type AuthStore = {
  token: string | null
  user: AuthUser | null
  email: string | null
  isHydrated: boolean
  setHydrated: (value: boolean) => void
  setEmail: (email: string | null) => void
  setUser: (user: AuthUser | null) => void
  setAuth: (token: string, user: AuthUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      email: null,
      isHydrated: false,

      setHydrated: (isHydrated) => set({ isHydrated }),
      setEmail: (email) => set({ email }),
      setUser: (user) => set({ user }),
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null, email: null }),
    }),
    {
      name: "meet-expert-auth",
      skipHydration: true,
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        email: s.email,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    }
  )
)
