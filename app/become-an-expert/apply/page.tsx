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
import { submitExpertApplication } from "@/lib/expert-api"
import type { EducationEntry, ExperienceEntry, PortfolioEntry } from "@/lib/expert-api"
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

const LANGUAGE_OPTIONS = [
  "English", "Bengali", "Arabic", "Hindi", "Urdu", "French", "Spanish", "German", "Chinese", "Japanese",
]

type FormData = {
  professional_headline: string
  bio: string
  languages: string[]
  registration_value: string
  intro_video: string
  avatar: File | null
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
  avatar: null,
  categoryId: "",
  subcategoryId: "",
  skillIds: [],
  years_of_experience: "",
  education: [emptyEdu()],
  experience: [emptyExp()],
  portfolio: [emptyPort()],
}

export default function BecomeExpertApplyPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const isExpert = user?.user_type === "expert"

  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState<FormData>(initialForm)

  const { categories, isLoading: taxLoading } = useTaxonomy()

  const subcategories = React.useMemo(
    () => categories.find((c) => c.id === Number(form.categoryId))?.subcategories ?? [],
    [categories, form.categoryId]
  )

  const skills = React.useMemo(
    () => subcategories.find((s) => s.id === Number(form.subcategoryId))?.skills ?? [],
    [subcategories, form.subcategoryId]
  )

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
    if (!token) router.replace("/login")
  }, [isHydrated, token, isExpert, router])

  const set = (key: keyof FormData, value: unknown) => {
    setForm((p) => {
      const next = { ...p, [key]: value }
      if (key === "categoryId") { next.subcategoryId = ""; next.skillIds = [] }
      if (key === "subcategoryId") { next.skillIds = [] }
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
    if (step < TOTAL) { setStep((s) => s + 1); return }
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
      avatar: form.avatar,
    })
  }

  if (!isHydrated || isExpert) {
    return (
      <main className="min-h-screen">
        <ProgressLoaderScreen className="min-h-screen" label="Loading…" />
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
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Expert Application</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step} of {TOTAL}: {STEPS[step - 1].title}
          </p>
        </div>

        <div className="mb-8 flex gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.id}
                className={cn(
                  "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  step >= s.id
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit}>
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
                  <LanguageCustomInput
                    selected={form.languages}
                    onAdd={(lang) => {
                      if (!form.languages.includes(lang)) set("languages", [...form.languages, lang])
                    }}
                  />
                  {form.languages.length === 0 && (
                    <p className="text-xs text-destructive">Select at least one language</p>
                  )}
                  <p className="text-xs text-muted-foreground">{form.languages.length} selected</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_value">Registration / License Number</Label>
                  <Input
                    id="registration_value"
                    value={form.registration_value}
                    onChange={(e) => set("registration_value", e.target.value)}
                    placeholder="e.g. BMDC-12345"
                    required
                  />
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
                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Photo <span className="text-muted-foreground">(optional)</span></Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => set("avatar", e.target.files?.[0] ?? null)}
                    className="cursor-pointer"
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
                  <CardDescription>Links to your work or website.</CardDescription>
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
                          <Label>Title</Label>
                          <Input
                            value={port.title}
                            onChange={(e) => updateArrayItem<PortfolioEntry>("portfolio", i, "title", e.target.value)}
                            placeholder="e.g. Personal website"
                            required
                          />
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
              <Button type="submit" className="gap-1">
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="gap-1">
                {isLoading && <ProgressLoader size="sm" />}
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}

function LanguageCustomInput({
  selected,
  onAdd,
}: {
  selected: string[]
  onAdd: (lang: string) => void
}) {
  const [value, setValue] = React.useState("")
  const handle = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue("")
  }
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handle() } }}
        placeholder="Other language…"
        className="h-8 text-sm"
      />
      <Button type="button" size="sm" variant="outline" onClick={handle} className="shrink-0">
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
