"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { useTaxonomy } from "@/hooks/use-taxonomy"
import {
  fetchMyExpertDetails,
  updateMyExpertDetails,
  type EducationEntry,
  type ExperienceEntry,
  type MyExpertDetails,
  type PortfolioEntry,
} from "@/lib/expert-api"
import { cn } from "@/lib/utils"

const LANGUAGE_OPTIONS = [
  "English",
  "Bengali",
  "Arabic",
  "Hindi",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Chinese",
  "Japanese",
]

const LANGUAGE_ALIASES: Record<string, string> = {
  en: "English",
  bn: "Bengali",
  eng: "English",
  bangla: "Bengali",
}

function normalizeLanguages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of raw) {
    const value = String(item).trim()
    if (!value) continue
    const mapped =
      LANGUAGE_ALIASES[value.toLowerCase()] ??
      LANGUAGE_OPTIONS.find((opt) => opt.toLowerCase() === value.toLowerCase()) ??
      value
    if (seen.has(mapped)) continue
    seen.add(mapped)
    result.push(mapped)
  }
  return result
}

const PORTFOLIO_TYPES = [
  "Facebook",
  "YouTube",
  "LinkedIn",
  "Instagram",
  "X (Twitter)",
  "Website",
  "Others",
] as const

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

const emptyEdu = (): EducationEntry => ({ institution: "", degree: "", year: "" })
const emptyExp = (): ExperienceEntry => ({
  title: "",
  organization: "",
  start_year: "",
  end_year: "",
  description: "",
})
const emptyPort = (): PortfolioEntry => ({ title: "", url: "" })

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

function detailsToForm(detail: MyExpertDetails): FormData {
  const education =
    Array.isArray(detail.education) && detail.education.length > 0
      ? detail.education.map((e) => ({
          institution: e.institution ?? "",
          degree: e.degree ?? "",
          year: e.year != null ? String(e.year) : "",
        }))
      : [emptyEdu()]
  const experience =
    Array.isArray(detail.experience) && detail.experience.length > 0
      ? detail.experience.map((e) => ({
          title: e.title ?? "",
          organization: e.organization ?? "",
          start_year: e.start_year != null ? String(e.start_year) : "",
          end_year: e.end_year != null ? String(e.end_year) : "",
          description: e.description ?? "",
        }))
      : [emptyExp()]
  const portfolio =
    Array.isArray(detail.portfolio) && detail.portfolio.length > 0
      ? detail.portfolio.map((p) => ({
          title: p.title ?? "",
          url: p.url ?? "",
        }))
      : [emptyPort()]

  return {
    professional_headline: detail.professional_headline ?? "",
    bio: detail.bio ?? "",
    languages: normalizeLanguages(detail.languages),
    registration_value: detail.registration_value ?? "",
    intro_video: detail.intro_video_url || detail.intro_video || "",
    categoryId: detail.category?.id != null ? String(detail.category.id) : "",
    subcategoryId:
      detail.subcategory?.id != null ? String(detail.subcategory.id) : "",
    skillIds: Array.isArray(detail.skills) ? detail.skills.map((s) => s.id) : [],
    years_of_experience:
      detail.years_of_experience != null ? String(detail.years_of_experience) : "",
    education,
    experience,
    portfolio,
  }
}

function toYear(value: number | string): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function ExpertDetailsForm({ token }: { token: string }) {
  const [form, setForm] = React.useState<FormData>(initialForm)
  const [detail, setDetail] = React.useState<MyExpertDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const { categories, isLoading: taxLoading } = useTaxonomy()

  const subcategories = React.useMemo(
    () =>
      categories.find((c) => c.id === Number(form.categoryId))?.subcategories ??
      [],
    [categories, form.categoryId]
  )

  const skills = React.useMemo(
    () =>
      subcategories.find((s) => s.id === Number(form.subcategoryId))?.skills ??
      [],
    [subcategories, form.subcategoryId]
  )

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchMyExpertDetails(token)
        if (cancelled) return
        const data = res.data
        if (!data) throw new Error("Expert details not found.")
        setDetail(data)
        setForm(detailsToForm(data))
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : "Failed to load expert details")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [token])

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

  function updateArrayItem<T>(
    key: keyof FormData,
    index: number,
    field: keyof T,
    value: string
  ) {
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
      return { ...p, [key]: arr.length > 0 ? arr : [key === "portfolio" ? emptyPort() : key === "experience" ? emptyExp() : emptyEdu()] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const education = form.education
        .filter((row) => row.institution.trim())
        .map((row) => ({
          institution: row.institution.trim(),
          degree: row.degree.trim(),
          year: toYear(row.year) ?? "",
        }))
      const experience = form.experience
        .filter((row) => row.title.trim())
        .map((row) => ({
          title: row.title.trim(),
          organization: row.organization.trim(),
          start_year: toYear(row.start_year) ?? "",
          end_year: toYear(row.end_year) ?? "",
          description: row.description.trim(),
        }))
      const portfolio = form.portfolio
        .filter((row) => row.url.trim())
        .map((row) => ({
          title: row.title.trim(),
          url: row.url.trim(),
        }))

      const res = await updateMyExpertDetails(token, {
        category_id: Number(form.categoryId),
        subcategory_id: Number(form.subcategoryId),
        professional_headline: form.professional_headline.trim(),
        bio: form.bio.trim(),
        years_of_experience: Number(form.years_of_experience),
        registration_value: form.registration_value.trim(),
        intro_video: form.intro_video.trim() || undefined,
        languages: form.languages,
        skill_ids: form.skillIds,
        education,
        experience,
        portfolio,
      })

      const updated = res.data
      if (updated) {
        setDetail(updated)
        setForm(detailsToForm(updated))
      }
      setSuccess(res.message || "Expert details updated successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expert details")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ProgressLoader size="lg" label="Loading expert details…" />
      </div>
    )
  }

  return (
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

      {detail?.slug && (
        <p className="text-sm text-muted-foreground">
          Public profile:{" "}
          <a
            href={`/experts/${detail.slug}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            /experts/{detail.slug}
          </a>
        </p>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your public expert profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expert-headline">Professional Headline</Label>
            <Input
              id="expert-headline"
              value={form.professional_headline}
              onChange={(e) => set("professional_headline", e.target.value)}
              placeholder="e.g. Senior Cardiologist with 10+ years"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-bio">Bio</Label>
            <Textarea
              id="expert-bio"
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-intro-video">
              Intro Video URL <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="expert-intro-video"
              value={form.intro_video}
              onChange={(e) => set("intro_video", e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Expertise</CardTitle>
          <CardDescription>Category, skills, and experience level.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expert-category">Category</Label>
            {taxLoading ? (
              <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                <ProgressLoader size="sm" /> Loading…
              </div>
            ) : (
              <Select
                id="expert-category"
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={`cat-${c.id}`} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {subcategories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="expert-subcategory">Subcategory</Label>
              <Select
                id="expert-subcategory"
                value={form.subcategoryId}
                onChange={(e) => set("subcategoryId", e.target.value)}
                required
              >
                <option value="">Select subcategory</option>
                {subcategories.map((s) => (
                  <option key={`sub-${s.id}`} value={s.id}>
                    {s.name}
                  </option>
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
            <Label htmlFor="expert-yoe">Years of Experience</Label>
            <Input
              id="expert-yoe"
              type="number"
              min={0}
              value={form.years_of_experience}
              onChange={(e) => set("years_of_experience", e.target.value)}
              placeholder="e.g. 5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expert-registration">Registration / License Number</Label>
            <Input
              id="expert-registration"
              value={form.registration_value}
              onChange={(e) => set("registration_value", e.target.value)}
              placeholder="e.g. BMDC-12345"
              required
            />
          </div>
        </CardContent>
      </Card>

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
                    onChange={(e) =>
                      updateArrayItem<EducationEntry>(
                        "education",
                        i,
                        "institution",
                        e.target.value
                      )
                    }
                    placeholder="e.g. University of Dhaka"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) =>
                      updateArrayItem<EducationEntry>(
                        "education",
                        i,
                        "degree",
                        e.target.value
                      )
                    }
                    placeholder="e.g. MBBS, MBA"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={edu.year}
                    onChange={(e) =>
                      updateArrayItem<EducationEntry>(
                        "education",
                        i,
                        "year",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2018"
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
                    onChange={(e) =>
                      updateArrayItem<ExperienceEntry>(
                        "experience",
                        i,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Career Coach"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Organization</Label>
                  <Input
                    value={exp.organization}
                    onChange={(e) =>
                      updateArrayItem<ExperienceEntry>(
                        "experience",
                        i,
                        "organization",
                        e.target.value
                      )
                    }
                    placeholder="e.g. CareerPath BD"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Year</Label>
                  <Input
                    type="number"
                    value={exp.start_year}
                    onChange={(e) =>
                      updateArrayItem<ExperienceEntry>(
                        "experience",
                        i,
                        "start_year",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2019"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Year</Label>
                  <Input
                    type="number"
                    value={exp.end_year}
                    onChange={(e) =>
                      updateArrayItem<ExperienceEntry>(
                        "experience",
                        i,
                        "end_year",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2025"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateArrayItem<ExperienceEntry>(
                        "experience",
                        i,
                        "description",
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      updateArrayItem<PortfolioEntry>(
                        "portfolio",
                        i,
                        "title",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select type</option>
                    {PORTFOLIO_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>URL</Label>
                  <Input
                    type="url"
                    value={port.url}
                    onChange={(e) =>
                      updateArrayItem<PortfolioEntry>(
                        "portfolio",
                        i,
                        "url",
                        e.target.value
                      )
                    }
                    placeholder="https://example.com"
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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            isSaving || form.languages.length === 0 || form.skillIds.length === 0
          }
        >
          {isSaving ? (
            <>
              <ProgressLoader size="sm" />
              Saving...
            </>
          ) : (
            "Save expert details"
          )}
        </Button>
      </div>
    </form>
  )
}
