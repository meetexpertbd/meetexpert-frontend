"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  MessageSquareText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import {
  fetchExpertApplication,
  type ExpertApplication,
  type ExpertApplicationStatus,
} from "@/lib/expert-api"
import { PLACEHOLDER_AVATAR } from "@/lib/experts-data"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: ExpertApplicationStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-3.5" />
        Approved
      </span>
    )
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
        <XCircle className="size-3.5" />
        Rejected
      </span>
    )
  }
  if (status === "needs_correction") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-400">
        <AlertCircle className="size-3.5" />
        Needs correction
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-400">
      <Clock className="size-3.5" />
      Pending review
    </span>
  )
}

function formatDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value == null || value === "") return null
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  )
}

export default function ApplicationPage() {
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const [application, setApplication] = React.useState<ExpertApplication | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [imgFailed, setImgFailed] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchExpertApplication(token)
      setApplication(res.data ?? null)
    } catch (e) {
      let message = "Could not load your application."
      if (e instanceof ApiError) message = e.message
      else if (e instanceof Error) message = e.message
      setError(message)
      setApplication(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    if (!isHydrated || !token) return
    void load()
  }, [isHydrated, token, load])

  if (!isHydrated || loading) {
    return <ProgressLoaderScreen label="Loading application…" />
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Expert Application</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void load()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-6 sm:p-8">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Expert Application</CardTitle>
            <CardDescription>
              You have not submitted an expert application yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/become-an-expert/apply">Apply now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const languages = Array.isArray(application.languages)
    ? application.languages
    : application.languages
      ? [String(application.languages)]
      : []
  const education = application.education ?? []
  const experience = application.experience ?? []
  const portfolio = application.portfolio ?? []
  const skills = application.skills ?? []
  const avatar =
    !imgFailed && application.avatar_url ? application.avatar_url : PLACEHOLDER_AVATAR
  const videoUrl = application.intro_video_url || application.intro_video
  const canResubmit =
    application.status === "needs_correction" || application.status === "rejected"

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Application</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your submitted expert application
            {formatDate(application.created_at)
              ? ` · Submitted ${formatDate(application.created_at)}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={application.status} />
          {canResubmit && (
            <Button size="sm" asChild>
              <Link href="/become-an-expert/apply">Update & resubmit</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card
          className={cn(
            "border-border",
            application.admin_feedback &&
              application.status !== "approved" &&
              "border-amber-500/40 bg-amber-500/5"
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="size-4" />
              Application status
            </CardTitle>
            <CardDescription>
              {application.status === "pending" &&
                "Your application is waiting for admin review."}
              {application.status === "approved" &&
                "Your application was approved. You can use expert features."}
              {application.status === "rejected" &&
                "Your application was rejected. Review the feedback below."}
              {application.status === "needs_correction" &&
                "Admin requested changes. Update your application and resubmit."}
              {formatDate(application.reviewed_at)
                ? ` Reviewed ${formatDate(application.reviewed_at)}.`
                : ""}
            </CardDescription>
          </CardHeader>
          {application.admin_feedback && (
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Admin feedback
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                {application.admin_feedback}
              </p>
            </CardContent>
          )}
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-5 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt=""
                className="size-16 rounded-lg object-cover"
                onError={() => setImgFailed(true)}
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {application.professional_headline}
                </p>
                <p className="text-sm text-muted-foreground">
                  {application.category?.name}
                  {application.subcategory?.name
                    ? ` · ${application.subcategory.name}`
                    : ""}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Category" value={application.category?.name} />
              <InfoRow label="Subcategory" value={application.subcategory?.name} />
              <InfoRow
                label="Languages"
                value={languages.length ? languages.join(", ") : null}
              />
              <InfoRow
                label="Experience"
                value={
                  application.years_of_experience != null
                    ? `${application.years_of_experience} years`
                    : null
                }
              />
              <InfoRow
                label="Registration / License"
                value={application.registration_value}
              />
              {videoUrl && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Intro video</dt>
                  <dd className="mt-1">
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open link
                      <ExternalLink className="size-3.5" />
                    </a>
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <InfoRow label="Bio" value={application.bio} />
              </div>
              {skills.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Skills</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full border border-border px-3 py-1 text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {education.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {education.map((item, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-medium">{item.degree}</span>
                  {item.institution ? ` — ${item.institution}` : ""}
                  {item.year ? (
                    <span className="text-muted-foreground"> ({item.year})</span>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {experience.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {experience.map((item, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-medium">{item.title}</span>
                  {item.organization ? ` at ${item.organization}` : ""}
                  <span className="text-muted-foreground">
                    {" "}
                    ({item.start_year}–{item.end_year || "Present"})
                  </span>
                  {item.description && (
                    <p className="mt-1 text-muted-foreground">{item.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {portfolio.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {portfolio.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50 hover:text-primary"
                >
                  {item.title || "Link"}
                  <ExternalLink className="size-3.5" />
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {application.documents && application.documents.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {application.documents.map((doc, i) =>
                doc.url ? (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50 hover:text-primary"
                  >
                    {doc.name || `Document ${i + 1}`}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <span
                    key={i}
                    className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
                  >
                    {doc.name || `Document ${i + 1}`}
                  </span>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
