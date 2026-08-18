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

export const FALLBACK_EXPERTS: ExpertItem[] = [
  {
    id: "demo-1",
    slug: "demo-rahman",
    name: "Adv. Rahman",
    category: "Legal",
    subcategory: "Corporate Lawyer",
    headline: "Corporate & Immigration Lawyer",
    bio: "Helps with company setup, contracts, and immigration paperwork.",
    yearsExperience: 12,
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    languages: ["English", "Bangla"],
    skills: ["Immigration", "Corporate Law"],
    expertCode: "MX-1001",
    slotPrice: 800,
    rating: 4.9,
    sessions: 200,
    duration: "30 min",
  },
  {
    id: "demo-2",
    slug: "demo-fatima",
    name: "Dr. Fatima",
    category: "Education",
    subcategory: "Study Abroad Advisor",
    headline: "Study abroad, SOP & visa guidance",
    bio: "Guides students through university applications and visas.",
    yearsExperience: 8,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    languages: ["English", "Bangla"],
    skills: ["SOP", "Visa"],
    expertCode: "MX-1002",
    slotPrice: 1200,
    rating: 4.8,
    sessions: 150,
    duration: "45 min",
  },
  {
    id: "demo-3",
    slug: "demo-abdullah",
    name: "Maulana Abdullah",
    category: "Religion",
    subcategory: "Islamic Scholar",
    headline: "Islamic scholar & family counselor",
    bio: "Private sessions on faith, family, and everyday guidance.",
    yearsExperience: 15,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    languages: ["Bangla", "Arabic", "English"],
    skills: ["Counseling"],
    expertCode: "MX-1003",
    slotPrice: 600,
    rating: 4.9,
    sessions: 180,
    duration: "30 min",
  },
  {
    id: "demo-4",
    slug: "demo-nabila",
    name: "Nabila Rahman",
    category: "Business",
    subcategory: "Career Mentor",
    headline: "Career planning & mentorship",
    bio: "Helps professionals plan the next role and interview with confidence.",
    yearsExperience: 10,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    languages: ["English", "Bangla"],
    skills: ["Career", "Interview"],
    expertCode: "MX-1004",
    slotPrice: 900,
    rating: 4.7,
    sessions: 120,
    duration: "30 min",
  },
]

export function expertProfileHref(expert: Pick<ExpertItem, "slug">) {
  if (!expert.slug || expert.slug.startsWith("demo-")) return "/experts"
  return `/experts/${expert.slug}`
}
