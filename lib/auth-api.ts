import { get, getAssetBaseUrl, post, postForm } from "@/lib/api-client"

export type AuthUser = {
  id: number
  name: string
  email: string
  user_type?: "user" | "expert" | string
  avatar?: string | null
}

export type Gender = "male" | "female" | "other" | "prefer_not_to_say"
export type PreferredLanguage = "en" | "bn"

export type UserProfileDetails = {
  gender?: Gender | null
  date_of_birth?: string | null
  phone?: string | null
  avatar?: string | null
  avatar_url?: string | null
  present_address?: string | null
  permanent_address?: string | null
  district?: string | null
  country?: string | null
  preferred_language?: PreferredLanguage | null
}

export type UserProfile = AuthUser & {
  profile: UserProfileDetails | null
}

export function resolveAvatarUrl(avatar?: string | null) {
  if (!avatar) return null
  if (avatar.startsWith("blob:") || avatar.startsWith("data:")) return avatar

  const assetBase = getAssetBaseUrl()

  try {
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      const url = new URL(avatar)
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".test")
      ) {
        return `${assetBase}${url.pathname}${url.search}`
      }
      return avatar
    }
  } catch {
    // fall through
  }

  if (avatar.startsWith("/")) return `${assetBase}${avatar}`
  if (avatar.startsWith("storage/")) return `${assetBase}/${avatar}`
  return `${assetBase}/storage/${avatar}`
}

type AvatarSource = {
  avatar?: string | null
  avatar_url?: string | null
  profile?: { avatar?: string | null; avatar_url?: string | null } | null
  expert_profile?: { avatar?: string | null; avatar_url?: string | null } | null
}

function firstAvatar(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (value?.trim()) return value.trim()
  }
  return null
}

export function getProfileAvatar(user: AvatarSource | null | undefined) {
  if (!user) return null
  return resolveAvatarUrl(
    firstAvatar(
      user.avatar_url,
      user.avatar,
      user.profile?.avatar_url,
      user.profile?.avatar,
      user.expert_profile?.avatar_url,
      user.expert_profile?.avatar
    )
  )
}

export function getNameInitials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function toAuthUser(
  user: AuthUser & AvatarSource & { email?: string }
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    user_type: user.user_type,
    avatar: getProfileAvatar(user),
  }
}

export type UpdateUserProfileInput = {
  gender?: Gender | ""
  date_of_birth?: string
  phone?: string
  present_address?: string
  permanent_address?: string
  district?: string
  country?: string
  preferred_language?: PreferredLanguage | ""
  avatar?: File | null
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type CheckEmailAction = "login" | "register"

type AuthPayload = {
  token?: string
  access_token?: string
  user?: AuthUser & AvatarSource
}

function getToken(data: AuthPayload | null | undefined) {
  return data?.token ?? data?.access_token ?? null
}

export async function checkEmail(email: string) {
  return post<ApiEnvelope<{ action: CheckEmailAction }>>("/auth/check-email", {
    email,
  })
}

export async function loginWithPassword(email: string, password: string) {
  const res = await post<ApiEnvelope<AuthPayload>>("/auth/login", {
    email,
    password,
  })
  return {
    ...res,
    token: getToken(res.data),
    user: res.data?.user ? toAuthUser(res.data.user) : null,
  }
}

export async function verifyRegisterOtp(email: string, otp: string) {
  return post<ApiEnvelope<unknown>>("/auth/register/verify-otp", { email, otp })
}

export async function resendRegisterOtp(email: string) {
  return post<ApiEnvelope<unknown>>("/auth/register/resend-otp", { email })
}

export async function completeRegistration(payload: {
  email: string
  name: string
  password: string
  password_confirmation: string
}) {
  const res = await post<ApiEnvelope<AuthPayload>>(
    "/auth/register/complete",
    payload
  )
  return {
    ...res,
    token: getToken(res.data),
    user: res.data?.user ? toAuthUser(res.data.user) : null,
  }
}

export async function logoutRequest(token: string) {
  return post<ApiEnvelope<unknown>>("/auth/logout", undefined, { token })
}

export async function forgotPassword(email: string) {
  return post<ApiEnvelope<unknown>>("/auth/forgot-password", { email })
}

export async function verifyForgotPasswordOtp(email: string, otp: string) {
  return post<ApiEnvelope<unknown>>("/auth/forgot-password/verify-otp", {
    email,
    otp,
  })
}

export async function resendForgotPasswordOtp(email: string) {
  return post<ApiEnvelope<unknown>>("/auth/forgot-password/resend-otp", {
    email,
  })
}

export async function resetPassword(payload: {
  email: string
  password: string
  password_confirmation: string
}) {
  return post<ApiEnvelope<unknown>>("/auth/forgot-password/reset", payload)
}

export async function fetchProfile(token: string) {
  const res = await get<ApiEnvelope<{ user?: UserProfile } & Partial<UserProfile>>>(
    "/user/profile",
    { token }
  )
  const data = res.data
  return (data?.user ?? data) as UserProfile
}

export async function updateUserProfile(
  token: string,
  input: UpdateUserProfileInput
) {
  const form = new FormData()

  for (const [key, value] of Object.entries(input)) {
    if (key === "avatar" || value === undefined || value === null || value === "") {
      continue
    }
    form.append(key, String(value))
  }

  if (input.avatar instanceof File) {
    form.append("avatar", input.avatar)
  }

  const res = await postForm<
    ApiEnvelope<{ user?: UserProfile } & Partial<UserProfile>>
  >("/user/profile", form, { token })

  const data = res.data
  const user = (data?.user ?? data) as UserProfile

  return {
    message: res.message,
    user,
  }
}
