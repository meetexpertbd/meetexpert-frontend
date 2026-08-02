import { fetchExpertById } from "@/lib/expert-api"
import type { EducationEntry, ExperienceEntry, ExpertEntity, PortfolioEntry } from "@/lib/expert-api"
import { PLACEHOLDER_AVATAR, type ExpertItem, mapExpertToItem } from "./experts-data"

export type EducationItem = {
  degree: string
  institution: string
  year: string
}

export type ReviewItem = {
  id: string
  author: string
  rating: number
  comment: string
  date: string
}

export type WorkExperienceItem = {
  organization: string
  designation: string
  department: string
  employment: string
  period: string
}

export type PortfolioItem = {
  title: string
  url: string
}

export type ExpertDetail = ExpertItem & {
  verified: boolean
  yearsExperience: number
  languages: string[]
  education: EducationItem[]
  expertise: string[]
  demoVideoEmbedUrl: string | null
  reviews: ReviewItem[]
  responseTime: string | null
  identityVerified: boolean
  joinedYear: number | null
  degreesLine: string
  currentWorkplace: string
  registrationLabel: string
  registrationValue: string
  isOnline: boolean
  workExperience: WorkExperienceItem[]
  portfolio: PortfolioItem[]
  rating: number
  sessions: number
  duration: string | null
  price: string | null
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function toYear(value: number | string | null | undefined): string {
  if (value == null || value === "") return ""
  return String(value)
}

function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "")
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v")
      if (id) return `https://www.youtube.com/embed/${id}`
      const embed = u.pathname.match(/\/embed\/([^/]+)/)
      if (embed?.[1]) return `https://www.youtube.com/embed/${embed[1]}`
    }
  } catch {
    return url
  }
  return url
}

function mapEducation(items: unknown): EducationItem[] {
  return asArray<EducationEntry>(items).map((e) => ({
    degree: e.degree ?? "",
    institution: e.institution ?? "",
    year: toYear(e.year),
  }))
}

function mapExperience(items: unknown): WorkExperienceItem[] {
  return asArray<ExperienceEntry>(items).map((e) => {
    const start = toYear(e.start_year)
    const end = toYear(e.end_year)
    const employment = [start, end].filter(Boolean).join(" – ")
    let period = ""
    const startN = Number(start)
    const endN = Number(end)
    if (Number.isFinite(startN) && Number.isFinite(endN) && endN >= startN) {
      const years = endN - startN
      period = years <= 0 ? "< 1 year" : `${years}+ years`
    }
    return {
      organization: e.organization ?? "",
      designation: e.title ?? "",
      department: e.description ?? "",
      employment,
      period,
    }
  })
}

function mapPortfolio(items: unknown): PortfolioItem[] {
  return asArray<PortfolioEntry>(items).map((p) => ({
    title: p.title ?? "",
    url: p.url ?? "",
  }))
}

export function mapExpertToDetail(expert: ExpertEntity): ExpertDetail {
  const base = mapExpertToItem(expert)
  const education = mapEducation(expert.education)
  const workExperience = mapExperience(expert.experience)
  const portfolio = mapPortfolio(expert.portfolio)
  const expertise = asArray<{ name: string }>(expert.skills).map((s) => s.name)
  const languages = asArray<string>(expert.languages)

  const degreesLine = education
    .map((e) => [e.degree, e.institution].filter(Boolean).join(", "))
    .filter(Boolean)
    .join(" · ")

  const current = workExperience[0]
  const currentWorkplace = current
    ? [current.designation, current.organization].filter(Boolean).join(" · ")
    : expert.subcategory?.name || expert.category?.name || ""

  return {
    ...base,
    image: expert.avatar_url || PLACEHOLDER_AVATAR,
    verified: true,
    identityVerified: true,
    yearsExperience: expert.years_of_experience ?? 0,
    languages,
    education,
    expertise,
    demoVideoEmbedUrl: youtubeEmbedUrl(expert.intro_video_url),
    reviews: [],
    responseTime: null,
    joinedYear: null,
    degreesLine: degreesLine || expert.professional_headline || "",
    currentWorkplace,
    registrationLabel: "Registration",
    registrationValue: expert.registration_value || expert.expert_code || "—",
    isOnline: false,
    workExperience,
    portfolio,
    rating: 0,
    sessions: 0,
    duration: null,
    price: null,
  }
}

export async function getExpertDetail(id: string): Promise<ExpertDetail | null> {
  try {
    const res = await fetchExpertById(id)
    if (!res?.data) return null
    return mapExpertToDetail(res.data)
  } catch {
    return null
  }
}
