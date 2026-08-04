import type { ExpertEntity } from "@/lib/expert-api"
import { resolveAvatarUrl } from "@/lib/auth-api"

export const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"

export type ExpertItem = {
  id: string
  slug: string
  name: string
  category: string
  subcategory: string
  headline: string
  bio: string
  yearsExperience: number
  image: string
  languages: string[]
  skills: string[]
  expertCode: string
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

export function mapExpertToItem(expert: ExpertEntity): ExpertItem {
  const languages = asArray<string>(expert.languages)
  const skills = asArray<{ name: string }>(expert.skills).map((s) => s.name)
  return {
    id: String(expert.id),
    slug: expert.slug,
    name: expert.name,
    category: expert.category?.name ?? "",
    subcategory: expert.subcategory?.name ?? "",
    headline: expert.professional_headline ?? "",
    bio: expert.bio ?? "",
    yearsExperience: expert.years_of_experience ?? 0,
    image: resolveAvatarUrl(expert.avatar_url || expert.avatar) || PLACEHOLDER_AVATAR,
    languages,
    skills,
    expertCode: expert.expert_code ?? "",
  }
}
