"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  User,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import { useMutation } from "@/hooks"
import {
  fetchExpertApplication,
  submitExpertApplication,
  applicationAdminFeedback,
  type ExpertApplication,
  type ExpertApplicationStatus,
} from "@/lib/expert-api"
import type { EducationEntry, ExperienceEntry, PortfolioEntry } from "@/lib/expert-api"
import { ApiError } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Profile", icon: User },
  { id: 2, title: "Expertise", icon: Briefcase },
  { id: 3, title: "Background", icon: GraduationCap },
] as const

const TOTAL = STEPS.length

const emptyEdu = (): EducationEntry => ({ institution: "", degree: "", year: "" })
const emptyExp = (): ExperienceEntry => ({ title: "", organization: "", start_year: "", end_year: "", description: "" })
const emptyPort = (): PortfolioEntry => ({ title: "", url: "" })

const PORTFOLIO_TYPES = [
  "Facebook",
  "YouTube",
  "LinkedIn",
  "Instagram",
  "X (Twitter)",
  "Website",
  "Others",
] as const

const LANGUAGE_OPTIONS = [
  "English", "Bengali", "Arabic", "Hindi", "Urdu", "French", "Spanish", "German", "Chinese", "Japanese",
]

type FormData = {
  professional_headline: string
  bio: string
  languages: string[]
  registration_value: string
  intro_video: string
  categoryId: string
  subcategoryId: string
  skillIds: number[]
  years_of_experience: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  portfolio: PortfolioEntry[]
}

const initialForm: FormData = {
  professional_headline: "",
  bio: "",
  languages: [],
  registration_value: "",
  intro_video: "",
  categoryId: "",
  subcategoryId: "",
  skillIds: [],
  years_of_experience: "",
  education: [emptyEdu()],
  experience: [emptyExp()],
  portfolio: [emptyPort()],
}

function applicationToForm(app: ExpertApplication): FormData {
  const education =
    Array.isArray(app.education) && app.education.length > 0
      ? app.education.map((e) => ({
          institution: e.institution ?? "",
          degree: e.degree ?? "",
          year: e.year != null ? String(e.year) : "",
        }))
      : [emptyEdu()]
  const experience =
    Array.isArray(app.experience) && app.experience.length > 0
      ? app.experience.map((e) => ({
          title: e.title ?? "",
          organization: e.organization ?? "",
          start_year: e.start_year != null ? String(e.start_year) : "",
          end_year: e.end_year != null ? String(e.end_year) : "",
          description: e.description ?? "",
        }))
      : [emptyExp()]
  const portfolio =
    Array.isArray(app.portfolio) && app.portfolio.length > 0
      ? app.portfolio.map((p) => ({
          title: p.title ?? "",
          url: p.url ?? "",
        }))
      : [emptyPort()]

  return {
    professional_headline: app.professional_headline ?? "",
    bio: app.bio ?? "",
    languages: Array.isArray(app.languages) ? app.languages.map(String) : [],
    registration_value: app.registration_value ?? "",
    intro_video: app.intro_video_url || app.intro_video || "",
    categoryId: app.category?.id != null ? String(app.category.id) : "",
    subcategoryId: app.subcategory?.id != null ? String(app.subcategory.id) : "",
    skillIds: Array.isArray(app.skills) ? app.skills.map((s) => s.id) : [],
    years_of_experience:
      app.years_of_experience != null ? String(app.years_of_experience) : "",
    education,
    experience,
    portfolio,
  }
}

function statusLabel(status: ExpertApplicationStatus | string): string {
  if (status === "review" || status === "needs_correction") return "Review"
  if (status === "approved") return "Approved"
  if (status === "rejected") return "Rejected"
  return "Pending"
}

function ApplicationStatusBadge({
  status,
  statusLabelText,
}: {
  status: ExpertApplicationStatus | string
  statusLabelText?: string | null
}) {
  const label = statusLabelText?.trim() || statusLabel(status)
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        {label}
      </span>
    )
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
        <XCircle className="size-3.5" />
        {label}
      </span>
    )
  }
  if (status === "review" || status === "needs_correction") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-800 dark:text-sky-300">
        <AlertCircle className="size-3.5" />
        {label}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
      <Clock className="size-3.5" />
      {label}
    </span>
  )
}

export default function BecomeExpertApplyPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isExpert = user?.user_type === "expert"

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState<FormData>(initialForm)
  const [existing, setExisting] = React.useState<ExpertApplication | null>(null)
  const [loadingApplication, setLoadingApplication] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const { categories, isLoading: taxLoading } = useTaxonomy()

  const subcategories = React.useMemo(
    () => categories.find((c) => c.id === Number(form.categoryId))?.subcategories ?? [],
    [categories, form.categoryId]
  )

  const skills = React.useMemo(
    () => subcategories.find((s) => s.id === Number(form.subcategoryId))?.skills ?? [],
    [subcategories, form.subcategoryId]
  )

  const canEdit = !existing || existing.status !== "approved"

  const isUpdate =
    existing != null &&
    (existing.status === "pending" ||
      existing.status === "review" ||
      existing.status === "needs_correction" ||
      existing.status === "rejected")

  const { mutate, isLoading, error } = useMutation(
    (data: Parameters<typeof submitExpertApplication>[1]) =>
      submitExpertApplication(token!, data),
    { onSuccess: () => router.push("/dashboard/application") }
  )

  React.useEffect(() => {
    if (!isHydrated) return
    if (isExpert) {
      router.replace("/dashboard")
      return
    }
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent("/become-an-expert/apply")}`)
      return
    }

    let cancelled = false
    async function load() {
      setLoadingApplication(true)
      setLoadError(null)
      try {
        const res = await fetchExpertApplication(token!)
        if (cancelled) return
        const app = res.data ?? null
        setExisting(app)
        if (app) setForm(applicationToForm(app))
      } catch (e) {
        if (cancelled) return
        let message = "Could not load your application."
        if (e instanceof ApiError) message = e.message
        else if (e instanceof Error) message = e.message
        setLoadError(message)
      } finally {
        if (!cancelled) setLoadingApplication(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isHydrated, token, isExpert, router])

  const set = (key: keyof FormData, value: unknown) => {
    setForm((p) => {
      const next = { ...p, [key]: value }
      if (key === "categoryId") {
        next.subcategoryId = ""
        next.skillIds = []
      }
      if (key === "subcategoryId") next.skillIds = []
      return next
    })
  }

  const toggleSkill = (id: number) =>
    setForm((p) => ({
      ...p,
      skillIds: p.skillIds.includes(id)
        ? p.skillIds.filter((s) => s !== id)
        : [...p.skillIds, id],
    }))

  function updateArrayItem<T>(key: keyof FormData, index: number, field: keyof T, value: string) {
    setForm((p) => {
      const arr = [...(p[key] as T[])]
      arr[index] = { ...arr[index], [field]: value }
      return { ...p, [key]: arr }
    })
  }

  function addArrayItem<T>(key: keyof FormData, empty: () => T) {
    setForm((p) => ({ ...p, [key]: [...(p[key] as T[]), empty()] }))
  }

  function removeArrayItem(key: keyof FormData, index: number) {
    setForm((p) => {
      const arr = (p[key] as unknown[]).filter((_, i) => i !== index)
      return { ...p, [key]: arr }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    if (step < TOTAL) {
      setStep((s) => s + 1)
      return
    }
    await mutate({
      category_id: Number(form.categoryId),
      subcategory_id: Number(form.subcategoryId),
      professional_headline: form.professional_headline,
      bio: form.bio,
      years_of_experience: Number(form.years_of_experience),
      registration_value: form.registration_value,
      intro_video: form.intro_video,
      languages: form.languages,
      skill_ids: form.skillIds,
      education: form.education,
      experience: form.experience,
      portfolio: form.portfolio,
    })
  }

  if (!isHydrated || isExpert || loadingApplication) {
    return (
      <main className="min-h-screen">
        <ProgressLoaderScreen className="min-h-screen" label="Loading application…" />
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Expert Application</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8">
          <Link
            href="/become-an-expert"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {isUpdate ? "Update Expert Application" : "Expert Application"}
            </h1>
            {existing && (
              <ApplicationStatusBadge
                status={existing.status}
                statusLabelText={existing.status_label}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step} of {TOTAL}: {STEPS[step - 1].title}
          </p>
        </div>

        {existing && (
          <div className="mb-6 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">Application status</span>
              <ApplicationStatusBadge
                status={existing.status}
                statusLabelText={existing.status_label}
              />
            </div>
            {applicationAdminFeedback(existing) && (
              <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                Admin feedback: {applicationAdminFeedback(existing)}
              </p>
            )}
            {!canEdit && (
              <p className="mt-2 text-muted-foreground">
                This application can no longer be edited.
              </p>
            )}
          </div>
        )}

        <div className="mb-8 flex gap-2" role="tablist" aria-label="Application sections">
          {STEPS.map((s) => {
            const Icon = s.icon
            const active = step === s.id
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={!canEdit} className="min-w-0 space-y-0 border-0 p-0">
          {/* Step 1 — Profile */}
          {step === 1 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your public profile information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={form.professional_headline}
                    onChange={(e) => set("professional_headline", e.target.value)}
                    placeholder="e.g. Senior Cardiologist with 10+ years"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Short intro and expertise"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() =>
                          set(
                            "languages",
                            form.languages.includes(lang)
                              ? form.languages.filter((l) => l !== lang)
                              : [...form.languages, lang]
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          form.languages.includes(lang)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  {form.languages.length === 0 && (
                    <p className="text-xs text-destructive">Select at least one language</p>
                  )}
                  <p className="text-xs text-muted-foreground">{form.languages.length} selected</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intro_video">Intro Video URL <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="intro_video"
                    value={form.intro_video}
                    onChange={(e) => set("intro_video", e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 — Expertise */}
          {step === 2 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
                <CardDescription>Category, skills, and experience level.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  {taxLoading ? (
                    <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                      <ProgressLoader size="sm" /> Loading…
                    </div>
                  ) : (
                    <Select
                      value={form.categoryId}
                      onChange={(e) => set("categoryId", e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={`cat-${c.id}`} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  )}
                </div>

                {subcategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Subcategory</Label>
                    <Select
                      value={form.subcategoryId}
                      onChange={(e) => set("subcategoryId", e.target.value)}
                      required
                    >
                      <option value="">Select subcategory</option>
                      {subcategories.map((s) => (
                        <option key={`sub-${s.id}`} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((sk) => (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => toggleSkill(sk.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-sm transition-colors",
                            form.skillIds.includes(sk.id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          )}
                        >
                          {sk.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {form.skillIds.length} selected
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="yoe">Years of Experience</Label>
                  <Input
                    id="yoe"
                    type="number"
                    min={0}
                    value={form.years_of_experience}
                    onChange={(e) => set("years_of_experience", e.target.value)}
                    placeholder="e.g. 5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_value">
                    Registration / License Number{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="registration_value"
                    value={form.registration_value}
                    onChange={(e) => set("registration_value", e.target.value)}
                    placeholder="e.g. BMDC-12345"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3 — Background */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Education */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Academic qualifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.education.map((edu, i) => (
                    <div key={i} className="relative rounded-lg border border-border p-4">
                      {form.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("education", i)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateArrayItem<EducationEntry>("education", i, "institution", e.target.value)}
                            placeholder="e.g. University of Dhaka"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateArrayItem<EducationEntry>("education", i, "degree", e.target.value)}
                            placeholder="e.g. MBBS, MBA"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={edu.year}
                            onChange={(e) => updateArrayItem<EducationEntry>("education", i, "year", e.target.value)}
                            placeholder="e.g. 2018"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => addArrayItem("education", emptyEdu)}
                  >
                    <Plus className="size-3.5" />
                    Add Education
                  </Button>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                  <CardDescription>Work and professional history.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.experience.map((exp, i) => (
                    <div key={i} className="relative rounded-lg border border-border p-4">
                      {form.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("experience", i)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Title / Role</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateArrayItem<ExperienceEntry>("experience", i, "title", e.target.value)}
                            placeholder="e.g. Career Coach"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Organization</Label>
                          <Input
                            value={exp.organization}
                            onChange={(e) => updateArrayItem<ExperienceEntry>("experience", i, "organization", e.target.value)}
                            placeholder="e.g. CareerPath BD"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Start Year</Label>
                          <Input
                            type="number"
                            value={exp.start_year}
                            onChange={(e) => updateArrayItem<ExperienceEntry>("experience", i, "start_year", e.target.value)}
                            placeholder="e.g. 2019"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>End Year</Label>
                          <Input
                            type="number"
                            value={exp.end_year}
                            onChange={(e) => updateArrayItem<ExperienceEntry>("experience", i, "end_year", e.target.value)}
                            placeholder="e.g. 2025"
                          />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateArrayItem<ExperienceEntry>("experience", i, "description", e.target.value)}
                            placeholder="Brief description of your role"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => addArrayItem("experience", emptyExp)}
                  >
                    <Plus className="size-3.5" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>Social links and website.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.portfolio.map((port, i) => (
                    <div key={i} className="relative rounded-lg border border-border p-4">
                      {form.portfolio.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("portfolio", i)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Type</Label>
                          <Select
                            value={port.title}
                            onChange={(e) => updateArrayItem<PortfolioEntry>("portfolio", i, "title", e.target.value)}
                            required
                          >
                            <option value="">Select type</option>
                            {PORTFOLIO_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>URL</Label>
                          <Input
                            type="url"
                            value={port.url}
                            onChange={(e) => updateArrayItem<PortfolioEntry>("portfolio", i, "url", e.target.value)}
                            placeholder="https://example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => addArrayItem("portfolio", emptyPort)}
                  >
                    <Plus className="size-3.5" />
                    Add Portfolio
                  </Button>
                </CardContent>
              </Card>

              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error.message}
                </p>
              )}
            </div>
          )}
          </fieldset>

          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            {step < TOTAL ? (
              <Button type="submit" className="gap-1" disabled={!canEdit}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !canEdit} className="gap-1">
                {isLoading && <ProgressLoader size="sm" />}
                {isUpdate ? "Update Application" : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
