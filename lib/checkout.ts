export type PaymentMethod = "sslcommerz"

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "sslcommerz"

export const PLATFORM_FEE_RATE = 0.15
export const VAT_RATE = 0.05

export const CHECKOUT_SESSION_KEYS = {
  bookingId: "mx_checkout_booking_id",
  paymentId: "mx_checkout_payment_id",
  expertSlug: "mx_checkout_expert_slug",
  method: "mx_checkout_method",
} as const

export type CheckoutDraft = {
  expertId: number
  expertSlug: string
  expertName: string
  expertImage: string
  headline: string
  availabilitySlotId: number
  date: string
  start: string
  end: string
  price: string | null
  duration: string | null
  amount: number | null
}

export type CheckoutFees = {
  subtotal: number
  platformFee: number
  vat: number
  total: number
}

export const PAYMENT_METHODS: {
  id: PaymentMethod
  name: string
  hint: string
  accent: string
}[] = [
  {
    id: "sslcommerz",
    name: "SSLCommerz",
    hint: "Cards / mobile banking aggregator",
    accent: "border-[#1A73E8]/40 bg-[#1A73E8]/8",
  },
]

export function saveCheckoutSession(payload: {
  bookingId: number
  paymentId: number
  expertSlug?: string
}) {
  if (typeof window === "undefined") return
  sessionStorage.setItem(CHECKOUT_SESSION_KEYS.bookingId, String(payload.bookingId))
  sessionStorage.setItem(CHECKOUT_SESSION_KEYS.paymentId, String(payload.paymentId))
  sessionStorage.setItem(CHECKOUT_SESSION_KEYS.method, DEFAULT_PAYMENT_METHOD)
  if (payload.expertSlug) {
    sessionStorage.setItem(CHECKOUT_SESSION_KEYS.expertSlug, payload.expertSlug)
  }
}

export function readCheckoutSession() {
  if (typeof window === "undefined") {
    return { bookingId: null, paymentId: null, expertSlug: null, method: null }
  }
  return {
    bookingId: sessionStorage.getItem(CHECKOUT_SESSION_KEYS.bookingId),
    paymentId: sessionStorage.getItem(CHECKOUT_SESSION_KEYS.paymentId),
    expertSlug: sessionStorage.getItem(CHECKOUT_SESSION_KEYS.expertSlug),
    method: sessionStorage.getItem(CHECKOUT_SESSION_KEYS.method),
  }
}

export function clearCheckoutSession() {
  if (typeof window === "undefined") return
  Object.values(CHECKOUT_SESSION_KEYS).forEach((key) => sessionStorage.removeItem(key))
}

export function extractPaymentUrl(checkoutPayload: unknown): string | null {
  if (!checkoutPayload || typeof checkoutPayload !== "object") return null
  const root = checkoutPayload as Record<string, unknown>
  const nested =
    root.checkout && typeof root.checkout === "object"
      ? (root.checkout as Record<string, unknown>)
      : root
  const url = nested.payment_url
  return typeof url === "string" && url.length > 0 ? url : null
}

export function buildCheckoutPath(draft: CheckoutDraft) {
  const q = new URLSearchParams({
    expert: draft.expertSlug,
    expert_id: String(draft.expertId),
    slot: String(draft.availabilitySlotId),
    date: draft.date,
    start: draft.start,
    end: draft.end,
  })
  if (draft.price) q.set("price", draft.price)
  if (draft.duration) q.set("duration", draft.duration)
  if (draft.amount != null && Number.isFinite(draft.amount)) q.set("amount", String(draft.amount))
  if (draft.expertName) q.set("name", draft.expertName)
  if (draft.headline) q.set("headline", draft.headline)
  if (draft.expertImage) q.set("image", draft.expertImage)
  return `/checkout?${q.toString()}`
}

export function parseAmount(price: string | null): number | null {
  if (!price) return null
  const n = Number(price.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : null
}

export function formatBdt(amount: number): string {
  return `${Math.round(amount).toLocaleString("en-BD")} BDT`
}

export function checkoutFees(subtotal: number): CheckoutFees {
  const platformFee = roundMoney(subtotal * PLATFORM_FEE_RATE)
  const vat = roundMoney(subtotal * VAT_RATE)
  return {
    subtotal: roundMoney(subtotal),
    platformFee,
    vat,
    total: roundMoney(subtotal + platformFee + vat),
  }
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function checkoutDraftFromSearch(params: URLSearchParams): CheckoutDraft | null {
  const expertSlug = params.get("expert") ?? ""
  const expertId = Number(params.get("expert_id"))
  const availabilitySlotId = Number(params.get("slot"))
  const date = params.get("date") ?? ""
  const start = params.get("start") ?? ""
  const end = params.get("end") ?? ""
  if (
    !expertSlug ||
    !Number.isFinite(expertId) ||
    !Number.isFinite(availabilitySlotId) ||
    !date ||
    !start ||
    !end
  ) {
    return null
  }
  return {
    expertSlug,
    expertId,
    availabilitySlotId,
    date,
    start,
    end,
    price: params.get("price"),
    duration: params.get("duration"),
    amount: parseAmount(params.get("amount")) ?? parseAmount(params.get("price")),
    expertName: params.get("name") ?? "Expert",
    headline: params.get("headline") ?? "",
    expertImage: params.get("image") ?? "",
  }
}
