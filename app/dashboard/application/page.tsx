"use client"

import * as React from "react"
import {
  CheckCircle2, Clock, XCircle,
  Pencil, Save, X, Plus, Trash2,
} from "lucide-react"

const LANGUAGE_OPTIONS = [
  "English", "Bengali", "Arabic", "Hindi", "Urdu", "French", "Spanish", "German", "Chinese", "Japanese",
]
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoader, ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { useGet, useMutation, useTaxonomy } from "@/hooks"
import { updateExpertApplication } from "@/lib/expert-api"
import type {
  ExpertApplication,
  ExpertApplicationInput,
  EducationEntry,
  ExperienceEntry,
  PortfolioEntry,
} from "@/lib/expert-api"
import type { ApiEnvelope } from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const APP_URL = "/expert/application"

const emptyEdu = (): EducationEntry => ({ institution: "", degree: "", year: "" })
const emptyExp = (): ExperienceEntry => ({ title: "", organization: "", start_year: "", end_year: "", description: "" })
const emptyPort = (): PortfolioEntry => ({ title: "", url: "" })

function StatusBadge({ status }: { status?: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="size-3" /> Approved
      </span>
    )
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="size-3" /> Rejected
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
      <Clock className="size-3" /> Pending Review
    </span>
  )
}

export default function ApplicationPage() {
  const token = useAuthStore((s) => s.token)

  const { data, isLoading, isError, refetch } = useGet<ApiEnvelope<ExpertApplication>>(
    token ? APP_URL : null,
    { enabled: Boolean(token) }
  )

  const application = data?.data

  if (isLoading) {
    return <ProgressLoaderScreen label="Loading application…" />
  }

  if (isError || !application) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Expert Application</CardTitle>
            <CardDescription>No application found. Submit your application to become an expert.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/become-an-expert/apply">Apply Now</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Application</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and update your expert application.</p>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <ApplicationForm application={application} token={token!} onSaved={refetch} />
    </div>
  )
}

type EditForm = {
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

function ApplicationForm({
  application,
  token,
  onSaved,
}: {
  application: ExpertApplication
  token: string
  onSaved: () => void
}) {
  const { categories, isLoading: taxLoading, getSubcategories, getSkills } = useTaxonomy()
  const [editing, setEditing] = React.useState(false)

  const [form, setForm] = React.useState<EditForm>({
    professional_headline: application.professional_headline ?? "",
    bio: application.bio ?? "",
    languages: Array.isArray(application.languages) ? application.languages : (application.languages ? [application.languages] : []),
    registration_value: application.registration_value ?? "",
    intro_video: application.intro_video ?? "",
    categoryId: String(application.category_id),
    subcategoryId: String(application.subcategory_id),
    skillIds: application.skill_ids ?? [],
    years_of_experience: String(application.years_of_experience ?? ""),
    education: application.education?.length ? application.education : [emptyEdu()],
    experience: application.experience?.length ? application.experience : [emptyExp()],
    portfolio: application.portfolio?.length ? application.portfolio : [emptyPort()],
  })

  const subcategories = React.useMemo(
    () => getSubcategories(Number(form.categoryId)),
    [form.categoryId, getSubcategories]
  )
  const skills = React.useMemo(
    () => getSkills(Number(form.categoryId), Number(form.subcategoryId)),
    [form.categoryId, form.subcategoryId, getSkills]
  )

  const { mutate, isLoading, error } = useMutation(
    (input: Partial<ExpertApplicationInput>) => updateExpertApplication(token, input),
    { onSuccess: () => { setEditing(false); onSaved() } }
  )

  const set = (key: keyof EditForm, value: unknown) => {
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
      skillIds: p.skillIds.includes(id) ? p.skillIds.filter((s) => s !== id) : [...p.skillIds, id],
    }))

  function updateArr<T>(key: keyof EditForm, index: number, field: keyof T, value: string) {
    setForm((p) => {
      const arr = [...(p[key] as T[])]
      arr[index] = { ...arr[index], [field]: value }
      return { ...p, [key]: arr }
    })
  }

  function addArr<T>(key: keyof EditForm, empty: () => T) {
    setForm((p) => ({ ...p, [key]: [...(p[key] as T[]), empty()] }))
  }

  function removeArr(key: keyof EditForm, index: number) {
    setForm((p) => ({ ...p, [key]: (p[key] as unknown[]).filter((_, i) => i !== index) }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await mutate({
      category_id: Number(form.categoryId),
      subcategory_id: Number(form.subcategoryId),
      professional_headline: form.professional_headline,
      bio: form.bio,
      languages: form.languages,
      registration_value: form.registration_value,
      intro_video: form.intro_video,
      years_of_experience: Number(form.years_of_experience),
      skill_ids: form.skillIds,
      education: form.education,
      experience: form.experience,
      portfolio: form.portfolio,
    })
  }

  const categoryName = categories.find((c) => c.id === application.category_id)?.name
  const subcategoryName = getSubcategories(application.category_id).find(
    (s) => s.id === application.subcategory_id
  )?.name

  if (!editing) {
    return (
      <div className="space-y-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Application Details</CardTitle>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Category" value={categoryName} />
              <InfoRow label="Subcategory" value={subcategoryName} />
              <InfoRow label="Headline" value={application.professional_headline} />
              <InfoRow label="Languages" value={Array.isArray(application.languages) ? application.languages.join(", ") : application.languages} />
              <InfoRow label="Experience" value={`${application.years_of_experience} years`} />
              <InfoRow label="Registration / License" value={application.registration_value} />
              {application.intro_video && (
                <InfoRow label="Intro Video" value={application.intro_video} />
              )}
              <div className="sm:col-span-2"><InfoRow label="Bio" value={application.bio} /></div>

              {application.skill_ids?.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Skills</dt>
                  <dd className="mt-1.5">
                    <SkillTags
                      skillIds={application.skill_ids}
                      skills={getSkills(application.category_id, application.subcategory_id)}
                    />
                  </dd>
                </div>
              )}

              {application.education?.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="mb-2 text-sm font-medium text-muted-foreground">Education</dt>
                  <dd className="space-y-2">
                    {application.education.map((e, i) => (
                      <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="font-medium">{e.degree}</span> — {e.institution}{" "}
                        <span className="text-muted-foreground">({e.year})</span>
                      </div>
                    ))}
                  </dd>
                </div>
              )}

              {application.experience?.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="mb-2 text-sm font-medium text-muted-foreground">Experience</dt>
                  <dd className="space-y-2">
                    {application.experience.map((e, i) => (
                      <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="font-medium">{e.title}</span> at {e.organization}{" "}
                        <span className="text-muted-foreground">({e.start_year}–{e.end_year || "Present"})</span>
                        {e.description && <p className="mt-1 text-muted-foreground">{e.description}</p>}
                      </div>
                    ))}
                  </dd>
                </div>
              )}

              {application.portfolio?.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="mb-2 text-sm font-medium text-muted-foreground">Portfolio</dt>
                  <dd className="flex flex-wrap gap-2">
                    {application.portfolio.map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50 hover:text-primary"
                      >
                        {p.title}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSave}>
      <div className="space-y-6">
        {/* Profile fields */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">Profile</CardTitle>
            <Button type="button" size="sm" variant="ghost" className="gap-1 text-muted-foreground" onClick={() => setEditing(false)}>
              <X className="size-3.5" /> Cancel
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Professional Headline</Label>
                <Input
                  value={form.professional_headline}
                  onChange={(e) => set("professional_headline", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
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
                <DashLangCustomInput
                  selected={form.languages}
                  onAdd={(lang) => { if (!form.languages.includes(lang)) set("languages", [...form.languages, lang]) }}
                />
                <p className="text-xs text-muted-foreground">{form.languages.length} selected</p>
              </div>
              <div className="space-y-2">
                <Label>Registration / License</Label>
                <Input value={form.registration_value} onChange={(e) => set("registration_value", e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Intro Video URL</Label>
                <Input value={form.intro_video} onChange={(e) => set("intro_video", e.target.value)} placeholder="https://" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expertise */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Expertise</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                {taxLoading ? (
                  <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
                    <ProgressLoader size="sm" /> Loading…
                  </div>
                ) : (
                  <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={`cat-${c.id}`} value={c.id}>{c.name}</option>)}
                  </Select>
                )}
              </div>
              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select value={form.subcategoryId} onChange={(e) => set("subcategoryId", e.target.value)} required>
                    <option value="">Select subcategory</option>
                    {subcategories.map((s) => <option key={`sub-${s.id}`} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input type="number" min={0} value={form.years_of_experience} onChange={(e) => set("years_of_experience", e.target.value)} required />
              </div>
            </div>
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
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {sk.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Education</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.education.map((edu, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4">
                {form.education.length > 1 && (
                  <button type="button" onClick={() => removeArr("education", i)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Institution</Label>
                    <Input value={edu.institution} onChange={(e) => updateArr<EducationEntry>("education", i, "institution", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Degree</Label>
                    <Input value={edu.degree} onChange={(e) => updateArr<EducationEntry>("education", i, "degree", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year</Label>
                    <Input type="number" value={edu.year} onChange={(e) => updateArr<EducationEntry>("education", i, "year", e.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addArr("education", emptyEdu)}>
              <Plus className="size-3.5" /> Add Education
            </Button>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Experience</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.experience.map((exp, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4">
                {form.experience.length > 1 && (
                  <button type="button" onClick={() => removeArr("experience", i)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title / Role</Label>
                    <Input value={exp.title} onChange={(e) => updateArr<ExperienceEntry>("experience", i, "title", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Organization</Label>
                    <Input value={exp.organization} onChange={(e) => updateArr<ExperienceEntry>("experience", i, "organization", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start Year</Label>
                    <Input type="number" value={exp.start_year} onChange={(e) => updateArr<ExperienceEntry>("experience", i, "start_year", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Year</Label>
                    <Input type="number" value={exp.end_year} onChange={(e) => updateArr<ExperienceEntry>("experience", i, "end_year", e.target.value)} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={exp.description} onChange={(e) => updateArr<ExperienceEntry>("experience", i, "description", e.target.value)} rows={2} />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addArr("experience", emptyExp)}>
              <Plus className="size-3.5" /> Add Experience
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Portfolio</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {form.portfolio.map((port, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4">
                {form.portfolio.length > 1 && (
                  <button type="button" onClick={() => removeArr("portfolio", i)} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={port.title} onChange={(e) => updateArr<PortfolioEntry>("portfolio", i, "title", e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>URL</Label>
                    <Input type="url" value={port.url} onChange={(e) => updateArr<PortfolioEntry>("portfolio", i, "url", e.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addArr("portfolio", emptyPort)}>
              <Plus className="size-3.5" /> Add Portfolio
            </Button>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="gap-1">
            {isLoading ? <ProgressLoader size="sm" /> : <Save className="size-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  )
}

function DashLangCustomInput({ selected, onAdd }: { selected: string[]; onAdd: (lang: string) => void }) {
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

function SkillTags({ skillIds, skills }: { skillIds: number[]; skills: { id: number; name: string }[] }) {
  const selected = skills.filter((s) => skillIds.includes(s.id))
  if (!selected.length) return <span className="text-sm text-muted-foreground">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {selected.map((s) => (
        <span key={s.id} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {s.name}
        </span>
      ))}
    </div>
  )
}
