import type { ExpertEntity } from "@/lib/expert-api"
import { parseSlotPrice } from "@/lib/expert-api"
import { resolveAvatarUrl } from "@/lib/auth-api"

export const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"

export type ExpertItem = {
  id: string
  slug: string
  name: string
  category: string
  categoryId?: number | null
  subcategory: string
  headline: string
  bio: string
  yearsExperience: number
  image: string
  languages: string[]
  skills: string[]
  expertCode: string
  slotPrice: number | null
  rating?: number | null
  sessions?: number | null
  duration?: string | null
}

export function formatSlotPrice(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(value)) return null
  return `${value.toLocaleString("en-BD")} BDT`
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function asExpertList(raw: unknown): ExpertEntity[] {
  if (Array.isArray(raw)) return raw as ExpertEntity[]
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: ExpertEntity[] }).data
  }
  return []
}

export function mapExpertToItem(expert: ExpertEntity): ExpertItem {
  const languages = asArray<string>(expert.languages)
  const skills = asArray<{ name: string }>(expert.skills).map((s) => s.name)
  const extra = expert as ExpertEntity & { rating?: number | null; sessions?: number | null; total_sessions?: number | null }
  return {
    id: String(expert.id),
    slug: expert.slug,
    name: expert.name,
    category: expert.category?.name ?? "",
    categoryId: expert.category?.id ?? null,
    subcategory: expert.subcategory?.name ?? "",
    headline: expert.professional_headline ?? "",
    bio: expert.bio ?? "",
    yearsExperience: expert.years_of_experience ?? 0,
    image: resolveAvatarUrl(expert.avatar_url || expert.avatar) || PLACEHOLDER_AVATAR,
    languages,
    skills,
    expertCode: expert.expert_code ?? "",
    slotPrice: parseSlotPrice(expert.slot_price),
    rating: extra.rating ?? null,
    sessions: extra.sessions ?? extra.total_sessions ?? null,
  }
}

export function expertProfileHref(expert: Pick<ExpertItem, "slug">) {
  if (!expert.slug) return "/experts"
  return `/experts/${expert.slug}`
}
