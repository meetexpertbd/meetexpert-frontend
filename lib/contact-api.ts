import { post } from "@/lib/api-client"
import type { ApiEnvelope } from "@/lib/auth-api"

export const CONTACT_API_URL = "/contact"

export type PreferredContactLanguage = "bn" | "en"

export type ContactMessageInput = {
  name: string
  phone: string
  subject: string
  message: string
  email?: string | null
  preferred_language?: PreferredContactLanguage | null
}

export type ContactMessage = {
  id: number
  name: string
  email: string | null
  phone: string
  subject: string
  message: string
  preferred_language: PreferredContactLanguage | null
  status: string
  created_at?: string
}

export async function submitContactMessage(
  input: ContactMessageInput,
  token?: string | null
) {
  const payload: ContactMessageInput = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
  }
  const email = input.email?.trim()
  if (email) payload.email = email
  if (input.preferred_language) payload.preferred_language = input.preferred_language

  return post<ApiEnvelope<ContactMessage>>(CONTACT_API_URL, payload, { token })
}

export function fieldErrorsFromBody(body: unknown): Record<string, string> {
  if (!body || typeof body !== "object" || !("errors" in body)) return {}
  const raw = (body as { errors?: Record<string, string[] | string> }).errors
  if (!raw) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    out[key] = Array.isArray(value) ? value[0] : value
  }
  return out
}
