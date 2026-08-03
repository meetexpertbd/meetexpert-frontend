import { get, postForm, put } from "@/lib/api-client"
import type { ApiEnvelope } from "@/lib/auth-api"

export const EXPERTS_API_URL = "/experts"

export type EducationEntry = {
  institution: string
  degree: string
  year: number | string
}

export type ExperienceEntry = {
  title: string
  organization: string
  start_year: number | string
  end_year: number | string
  description: string
}

export type PortfolioEntry = {
  title: string
  url: string
}

export type ExpertTaxonomyRef = {
  id: number
  name: string
  slug: string
}

export type ExpertSkill = ExpertTaxonomyRef

export type ExpertEntity = {
  id: number
  name: string
  uuid: string
  expert_code: string
  slug: string
  professional_headline: string
  bio: string
  years_of_experience: number
  registration_value: string
  intro_video: string | null
  intro_video_url: string | null
  languages: string[]
  avatar: string | null
  avatar_url: string | null
  documents: unknown[]
  education: EducationEntry[]
  experience: ExperienceEntry[]
  portfolio: PortfolioEntry[]
  category: ExpertTaxonomyRef
  subcategory: ExpertTaxonomyRef
  skills: ExpertSkill[]
}

export type ExpertsListParams = {
  category_id?: number
  subcategory_id?: number
  skill_id?: number
  skill_ids?: number[]
  page?: number
  per_page?: number
}

function expertsQuery(params?: ExpertsListParams): string {
  if (!params) return ""
  const q = new URLSearchParams()
  if (params.category_id != null) q.set("category_id", String(params.category_id))
  if (params.subcategory_id != null) q.set("subcategory_id", String(params.subcategory_id))
  if (params.skill_id != null) q.set("skill_id", String(params.skill_id))
  if (params.skill_ids?.length) {
    for (const id of params.skill_ids) q.append("skill_ids[]", String(id))
  }
  if (params.page != null) q.set("page", String(params.page))
  if (params.per_page != null) q.set("per_page", String(params.per_page))
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function fetchExperts(params?: ExpertsListParams) {
  return get<ApiEnvelope<ExpertEntity[]>>(
    `${EXPERTS_API_URL}${expertsQuery(params)}`
  )
}

export async function fetchExpertById(id: number | string) {
  return get<ApiEnvelope<ExpertEntity>>(`${EXPERTS_API_URL}/${id}`)
}

export type ExpertApplication = {
  id?: number
  category_id: number
  subcategory_id: number
  professional_headline: string
  bio: string
  years_of_experience: number
  registration_value: string
  intro_video?: string
  languages: string[]
  skill_ids: number[]
  education: EducationEntry[]
  experience: ExperienceEntry[]
  portfolio: PortfolioEntry[]
  status?: "pending" | "approved" | "rejected"
  created_at?: string
  updated_at?: string
}

export type ExpertApplicationInput = Omit<ExpertApplication, "id" | "status" | "created_at" | "updated_at"> & {
  avatar?: File | null
}

function buildFormData(input: ExpertApplicationInput): FormData {
  const fd = new FormData()
  fd.append("category_id", String(input.category_id))
  fd.append("subcategory_id", String(input.subcategory_id))
  fd.append("professional_headline", input.professional_headline)
  fd.append("bio", input.bio)
  fd.append("years_of_experience", String(input.years_of_experience))
  fd.append("registration_value", input.registration_value)
  if (input.intro_video) fd.append("intro_video", input.intro_video)
  fd.append("languages", JSON.stringify(input.languages))
  fd.append("skill_ids", JSON.stringify(input.skill_ids))
  fd.append("education", JSON.stringify(input.education))
  fd.append("experience", JSON.stringify(input.experience))
  fd.append("portfolio", JSON.stringify(input.portfolio))
  if (input.avatar instanceof File) fd.append("avatar", input.avatar)
  return fd
}

export async function submitExpertApplication(token: string, input: ExpertApplicationInput) {
  return postForm<ApiEnvelope<ExpertApplication>>(
    "/expert/application",
    buildFormData(input),
    { token }
  )
}

export async function fetchExpertApplication(token: string) {
  return get<ApiEnvelope<ExpertApplication>>(
    "/expert/application",
    { token }
  )
}

export async function updateExpertApplication(token: string, input: Partial<ExpertApplicationInput>) {
  return put<ApiEnvelope<ExpertApplication>>(
    "/expert/application",
    input,
    { token }
  )
}

export const EXPERT_AVAILABILITY_URL = "/expert/availability"

export type AvailabilitySlot = {
  id?: number
  start: string
  end: string
}

export type AvailabilityDay = {
  day_of_week: number
  enabled: boolean
  slots: AvailabilitySlot[]
}

export type ExpertAvailability = {
  days: AvailabilityDay[]
}

export type ExpertAvailabilityInput = {
  days: Array<{
    day_of_week: number
    enabled: boolean
    slots?: Array<{ start: string; end: string }> | null
  }>
}

function normalizeTime(value: string): string {
  if (!value) return "09:00"
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  return `${m[1].padStart(2, "0")}:${m[2]}`
}

export function emptyAvailabilityDays(): AvailabilityDay[] {
  return Array.from({ length: 7 }, (_, day_of_week) => ({
    day_of_week,
    enabled: false,
    slots: [],
  }))
}

export function normalizeAvailabilityDays(
  raw: ExpertAvailability | AvailabilityDay[] | null | undefined
): AvailabilityDay[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.days)
      ? raw.days
      : []

  const byDay = new Map<number, AvailabilityDay>()
  for (const day of list) {
    const dayOfWeek = Number(day.day_of_week)
    if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) continue
    byDay.set(dayOfWeek, {
      day_of_week: dayOfWeek,
      enabled: Boolean(day.enabled),
      slots: (day.slots ?? []).map((slot) => ({
        id: slot.id,
        start: normalizeTime(slot.start),
        end: normalizeTime(slot.end),
      })),
    })
  }

  return emptyAvailabilityDays().map(
    (fallback) => byDay.get(fallback.day_of_week) ?? fallback
  )
}

export async function fetchExpertAvailability(token: string) {
  return get<ApiEnvelope<ExpertAvailability | AvailabilityDay[]>>(
    EXPERT_AVAILABILITY_URL,
    { token }
  )
}

export async function saveExpertAvailability(
  token: string,
  input: ExpertAvailabilityInput
) {
  return put<ApiEnvelope<ExpertAvailability | AvailabilityDay[]>>(
    EXPERT_AVAILABILITY_URL,
    input,
    { token }
  )
}

export const EXPERT_SLOT_PRICE_URL = "/expert/slot-price"

export type ExpertSlotPrice = {
  slot_price: number
}

export type ExpertSlotPriceInput = {
  slot_price: number
}

export function parseSlotPrice(
  raw: ExpertSlotPrice | { price?: number | string | null; slot_price?: number | string | null } | number | string | null | undefined
): number | null {
  if (raw == null) return null
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null
  if (typeof raw === "string") {
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  }
  const value = raw.slot_price ?? raw.price
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function fetchExpertSlotPrice(token: string) {
  return get<ApiEnvelope<ExpertSlotPrice | { price?: number } | number>>(
    EXPERT_SLOT_PRICE_URL,
    { token }
  )
}

export async function saveExpertSlotPrice(
  token: string,
  input: ExpertSlotPriceInput
) {
  return put<ApiEnvelope<ExpertSlotPrice | { price?: number } | number>>(
    EXPERT_SLOT_PRICE_URL,
    input,
    { token }
  )
}
