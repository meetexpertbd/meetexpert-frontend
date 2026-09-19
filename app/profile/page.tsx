"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, Camera, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ExpertDetailsForm } from "@/components/profile/expert-details-form"
import {
  fetchProfile,
  updateUserProfile,
  getProfileAvatar,
  toAuthUser,
  type Gender,
  type PreferredLanguage,
  type UserProfile,
} from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type ProfileTab = "profile" | "expert"

type FormState = {
  gender: Gender | ""
  date_of_birth: string
  phone: string
  present_address: string
  permanent_address: string
  district: string
  country: string
  preferred_language: PreferredLanguage | ""
}

const emptyForm: FormState = {
  gender: "",
  date_of_birth: "",
  phone: "",
  present_address: "",
  permanent_address: "",
  district: "",
  country: "BD",
  preferred_language: "bn",
}

function profileToForm(user: UserProfile | null): FormState {
  const details = user?.profile
  return {
    gender: details?.gender ?? "",
    date_of_birth: details?.date_of_birth?.slice(0, 10) ?? "",
    phone: details?.phone ?? "",
    present_address: details?.present_address ?? "",
    permanent_address: details?.permanent_address ?? "",
    district: details?.district ?? "",
    country: details?.country ?? "BD",
    preferred_language: details?.preferred_language ?? "bn",
  }
}

export default function UserProfilePage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const setUser = useAuthStore((s) => s.setUser)

  const isExpert = authUser?.user_type === "expert"
  const [tab, setTab] = React.useState<ProfileTab>("profile")

  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login")
    }
  }, [isHydrated, token, router])

  React.useEffect(() => {
    if (!isHydrated || !token) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const user = await fetchProfile(token!)
        if (cancelled) return
        setProfile(user)
        setForm(profileToForm(user))
        setAvatarPreview(getProfileAvatar(user))
        setUser(toAuthUser(user))
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load profile")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isHydrated, token, setUser])

  React.useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await updateUserProfile(token, {
        ...form,
        country: form.country.trim().toUpperCase().slice(0, 2),
        avatar: avatarFile,
      })
      const user = res.user
      if (user) {
        setProfile(user)
        setForm(profileToForm(user))
        setUser(toAuthUser(user))

        const serverAvatar = getProfileAvatar(user)
        const previousPreview = avatarPreview

        if (serverAvatar) {
          const probe = new window.Image()
          probe.onload = () => {
            if (previousPreview?.startsWith("blob:")) {
              URL.revokeObjectURL(previousPreview)
            }
            setAvatarPreview(serverAvatar)
          }
          probe.onerror = () => {
            if (!previousPreview) setAvatarPreview(null)
          }
          probe.src = serverAvatar
        } else if (!previousPreview) {
          setAvatarPreview(null)
        }
      }
      setAvatarFile(null)
      setSuccess(res.message || "Profile updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isHydrated || !token) {
    return (
      <ProgressLoaderScreen
        className="min-h-[calc(100vh-3.5rem)]"
        label="Loading…"
      />
    )
  }

  const myProfileForm = isLoading ? (
    <div className="flex flex-col items-center justify-center py-16">
      <ProgressLoader size="lg" label="Loading profile…" />
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          {success}
        </p>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt=""
                className="size-full object-cover"
                onError={() => setAvatarPreview(null)}
              />
            ) : (
              <User className="size-10 text-muted-foreground" />
            )}
          </div>
          <label
            className={cn(
              "absolute bottom-0 right-0 flex size-8 cursor-pointer items-center justify-center rounded-full",
              "border border-border bg-background text-foreground shadow-sm hover:bg-muted"
            )}
          >
            <Camera className="size-4" />
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="truncate text-lg font-semibold">
            {profile?.name ?? authUser?.name ?? "User"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {profile?.email ?? authUser?.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Email cannot be changed here.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+8801XXXXXXXXX"
            maxLength={32}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of birth</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => updateField("date_of_birth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            value={form.gender}
            onChange={(e) =>
              updateField("gender", e.target.value as Gender | "")
            }
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferred_language">Preferred language</Label>
          <Select
            id="preferred_language"
            value={form.preferred_language}
            onChange={(e) =>
              updateField(
                "preferred_language",
                e.target.value as PreferredLanguage | ""
              )
            }
          >
            <option value="bn">Bangla</option>
            <option value="en">English</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            value={form.district}
            onChange={(e) => updateField("district", e.target.value)}
            placeholder="Dhaka"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={form.country}
            onChange={(e) =>
              updateField("country", e.target.value.toUpperCase().slice(0, 2))
            }
            placeholder="BD"
            maxLength={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="present_address">Present address</Label>
        <Textarea
          id="present_address"
          value={form.present_address}
          onChange={(e) => updateField("present_address", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="permanent_address">Permanent address</Label>
        <Textarea
          id="permanent_address"
          value={form.permanent_address}
          onChange={(e) => updateField("permanent_address", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/bookings">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <ProgressLoader size="sm" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isExpert && tab === "expert" ? "Expert Details" : "My Profile"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isExpert && tab === "expert"
            ? "View and update your public expert profile."
            : "View and update your personal information."}
        </p>
      </div>

      {isExpert && (
        <div className="mb-6 flex gap-2" role="tablist" aria-label="Profile sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "profile"}
            onClick={() => setTab("profile")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
              tab === "profile"
                ? "border-primary/50 bg-primary/5 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <User className="size-4 shrink-0" />
            My Profile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "expert"}
            onClick={() => setTab("expert")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
              tab === "expert"
                ? "border-primary/50 bg-primary/5 text-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Briefcase className="size-4 shrink-0" />
            Expert Details
          </button>
        </div>
      )}

      {isExpert && tab === "expert" ? (
        <ExpertDetailsForm token={token} />
      ) : (
        <Card>
          <CardContent className="p-6 sm:p-8">{myProfileForm}</CardContent>
        </Card>
      )}
    </div>
  )
}
