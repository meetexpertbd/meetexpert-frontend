import { get, post, postForm, put } from "@/lib/api-client"
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
  slot_price?: number | null
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

export async function fetchExpertBySlug(slug: string) {
  return get<ApiEnvelope<ExpertDetailEntity>>(
    `${EXPERTS_API_URL}/${encodeURIComponent(slug)}`
  )
}

export async function fetchExpertAvailableSlots(
  slug: string,
  date: string
) {
  return get<ApiEnvelope<ExpertAvailableSlotsData>>(
    `${EXPERTS_API_URL}/${encodeURIComponent(slug)}/available-slots?date=${encodeURIComponent(date)}`
  )
}

export type ExpertReviewsData = {
  total_reviews: number
  reviews: BookingReview[]
  pagination: {
    current_page: number
    per_page: number
    last_page: number
    total: number
  }
}

export async function fetchExpertReviews(
  slug: string,
  page = 1
) {
  return get<ApiEnvelope<ExpertReviewsData>>(
    `${EXPERTS_API_URL}/${encodeURIComponent(slug)}/reviews?page=${page}`
  )
}

export const BOOKINGS_API_URL = "/bookings"
export const USER_BOOKINGS_API_URL = "/user/bookings"
export const EXPERT_BOOKINGS_API_URL = "/expert/bookings"

export type CreateBookingInput = {
  expert_id: number
  availability_slot_id: number
  date: string
  notes?: string | null
}

export type BookingExpert = {
  id: number
  name: string
  slug?: string | null
  professional_headline?: string | null
  avatar_url?: string | null
  slot_price?: number | null
}

export type BookingUser = {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
}

export type BookingReview = {
  id: number
  booking_id: number
  rating: number
  comment: string | null
  user?: { id: number; name: string; avatar_url?: string | null } | null
  expert?: { id: number; name: string } | null
  created_at?: string
  updated_at?: string
}

export type BookingReviewInput = {
  rating: number
  comment?: string | null
}

export type BookingEntity = {
  id: number
  status: string
  scheduled_date: string
  start_time: string
  end_time: string
  notes: string | null
  availability_slot_id: number
  expert?: BookingExpert | null
  user?: BookingUser | null
  review?: BookingReview | null
  meeting?: unknown
  meeting_joins?: MeetingJoins | null
  created_at?: string
  updated_at?: string
}

export type UserBookingsParams = {
  status?: "confirmed" | "cancelled"
  page?: number
  per_page?: number
}

export type PaginatedBookings = {
  data: BookingEntity[]
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
  links?: unknown
}

function normalizeBookingsPayload(
  raw: BookingEntity[] | PaginatedBookings | null | undefined
): PaginatedBookings {
  if (Array.isArray(raw)) {
    return { data: raw, meta: { total: raw.length, current_page: 1, last_page: 1 } }
  }
  if (raw && Array.isArray(raw.data)) {
    return raw
  }
  return { data: [], meta: { total: 0, current_page: 1, last_page: 1 } }
}

function bookingsQuery(params?: UserBookingsParams): string {
  if (!params) return ""
  const q = new URLSearchParams()
  if (params.status) q.set("status", params.status)
  if (params.page != null) q.set("page", String(params.page))
  if (params.per_page != null) q.set("per_page", String(params.per_page))
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function createBooking(token: string, input: CreateBookingInput) {
  return post<ApiEnvelope<BookingEntity>>(BOOKINGS_API_URL, input, { token })
}

export async function fetchUserBookings(
  token: string,
  params?: UserBookingsParams
) {
  const res = await get<ApiEnvelope<BookingEntity[] | PaginatedBookings>>(
    `${USER_BOOKINGS_API_URL}${bookingsQuery(params)}`,
    { token }
  )
  return {
    ...res,
    data: normalizeBookingsPayload(res.data),
  }
}

export async function fetchExpertBookings(
  token: string,
  params?: UserBookingsParams
) {
  const res = await get<ApiEnvelope<BookingEntity[] | PaginatedBookings>>(
    `${EXPERT_BOOKINGS_API_URL}${bookingsQuery(params)}`,
    { token }
  )
  return {
    ...res,
    data: normalizeBookingsPayload(res.data),
  }
}

export const EXPERT_DASHBOARD_URL = "/expert/dashboard"

export type ExpertDashboardProfile = {
  id: number
  name: string
  slug?: string | null
  expert_code?: string | null
  professional_headline?: string | null
  avatar_url?: string | null
  status?: string | null
  slot_price?: number | null
}

export type ExpertDashboardStats = {
  total_bookings: number
  upcoming_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  todays_bookings: number
  total_reviews: number
  average_rating: number | null
  estimated_earnings: number | null
}

export type ExpertDashboardData = {
  profile: ExpertDashboardProfile
  stats: ExpertDashboardStats
  upcoming_bookings: BookingEntity[]
  recent_reviews: BookingReview[]
}

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && "data" in value && Array.isArray((value as { data: unknown }).data)) {
    return (value as { data: T[] }).data
  }
  return []
}

export async function fetchExpertDashboard(token: string) {
  const res = await get<ApiEnvelope<ExpertDashboardData>>(EXPERT_DASHBOARD_URL, { token })
  const raw = res.data
  return {
    ...res,
    data: {
      profile: raw?.profile ?? ({} as ExpertDashboardProfile),
      stats: raw?.stats ?? {
        total_bookings: 0,
        upcoming_bookings: 0,
        completed_bookings: 0,
        cancelled_bookings: 0,
        todays_bookings: 0,
        total_reviews: 0,
        average_rating: null,
        estimated_earnings: null,
      },
      upcoming_bookings: asList<BookingEntity>(raw?.upcoming_bookings),
      recent_reviews: asList<BookingReview>(raw?.recent_reviews),
    } satisfies ExpertDashboardData,
  }
}

export function bookingReviewUrl(bookingId: number | string) {
  return `${BOOKINGS_API_URL}/${bookingId}/review`
}

export async function fetchBookingReview(token: string, bookingId: number | string) {
  return get<ApiEnvelope<BookingReview>>(bookingReviewUrl(bookingId), { token })
}

export async function createBookingReview(
  token: string,
  bookingId: number | string,
  input: BookingReviewInput
) {
  return post<ApiEnvelope<BookingReview>>(bookingReviewUrl(bookingId), input, { token })
}

export async function updateBookingReview(
  token: string,
  bookingId: number | string,
  input: BookingReviewInput
) {
  return put<ApiEnvelope<BookingReview>>(bookingReviewUrl(bookingId), input, { token })
}

export type AgoraMeetingCredentials = {
  app_id: string
  channel: string
  token: string
  uid: string | number
}

export type MeetingJoinStatus = "joined" | "not_joined"

export type MeetingJoinParty = {
  status: MeetingJoinStatus
  joined_at: string | null
}

export type MeetingJoins = {
  user: MeetingJoinParty
  expert: MeetingJoinParty
}

export type BookingMeetingPayload = {
  credentials: AgoraMeetingCredentials | null
  meeting_joins: MeetingJoins | null
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === "string" && value.trim()) return value.trim()
    if (typeof value === "number" && Number.isFinite(value)) return String(value)
  }
  return null
}

function meetingPayloadRoot(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>
  if (obj.data && typeof obj.data === "object") {
    return obj.data as Record<string, unknown>
  }
  if (obj.meeting && typeof obj.meeting === "object") {
    return obj.meeting as Record<string, unknown>
  }
  return obj
}

function normalizeJoinParty(raw: unknown): MeetingJoinParty {
  if (!raw || typeof raw !== "object") {
    return { status: "not_joined", joined_at: null }
  }
  const obj = raw as Record<string, unknown>
  const status =
    obj.status === "joined" || obj.status === "not_joined"
      ? obj.status
      : "not_joined"
  const joinedAt =
    typeof obj.joined_at === "string" && obj.joined_at.trim()
      ? obj.joined_at
      : null
  return { status, joined_at: joinedAt }
}

export function normalizeMeetingJoins(raw: unknown): MeetingJoins | null {
  const root = meetingPayloadRoot(raw)
  if (!root) return null
  const joins = root.meeting_joins
  if (!joins || typeof joins !== "object") return null
  const obj = joins as Record<string, unknown>
  return {
    user: normalizeJoinParty(obj.user),
    expert: normalizeJoinParty(obj.expert),
  }
}

export function normalizeMeetingCredentials(
  raw: unknown
): AgoraMeetingCredentials | null {
  const nested = meetingPayloadRoot(raw)
  if (!nested) return null

  const appId =
    pickString(nested, ["app_id", "appId", "agora_app_id"]) ??
    process.env.NEXT_PUBLIC_AGORA_APP_ID ??
    null
  const channel = pickString(nested, [
    "channel",
    "channel_name",
    "channelName",
    "agora_channel",
  ])
  const token =
    pickString(nested, [
      "token",
      "rtc_token",
      "rtcToken",
      "agora_token",
    ]) ?? ""
  const uidRaw = nested.uid ?? nested.user_id ?? nested.userId ?? nested.agora_uid
  const uid =
    typeof uidRaw === "number" || typeof uidRaw === "string"
      ? uidRaw
      : pickString(nested, ["uid", "user_id", "userId"]) ?? 0

  if (!appId || !channel) return null

  return {
    app_id: appId,
    channel,
    token,
    uid,
  }
}

export function normalizeBookingMeeting(raw: unknown): BookingMeetingPayload {
  return {
    credentials: normalizeMeetingCredentials(raw),
    meeting_joins: normalizeMeetingJoins(raw),
  }
}

export async function fetchBookingMeeting(token: string, bookingId: number | string) {
  return get<ApiEnvelope<unknown>>(`/bookings/${bookingId}/meeting`, { token })
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

export type ExpertDetailEntity = ExpertEntity & {
  days?: AvailabilityDay[]
}

export type ExpertAvailableSlot = {
  id: number
  day_of_week: number
  start: string
  end: string
  slot_price: number | null
  is_booked: boolean
}

export type ExpertAvailableSlotsData = {
  date: string
  slots: ExpertAvailableSlot[]
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
  const value =
    "slot_price" in raw && raw.slot_price != null && raw.slot_price !== ""
      ? raw.slot_price
      : "price" in raw
        ? raw.price
        : undefined
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
