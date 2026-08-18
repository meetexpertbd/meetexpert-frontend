export type PaymentMethod = "bkash" | "ssl" | "stripe"

export const PLATFORM_FEE_RATE = 0.15
export const VAT_RATE = 0.05

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
  { id: "bkash", name: "bKash", hint: "Pay with your bKash wallet", accent: "border-[#E2136E]/40 bg-[#E2136E]/8" },
  { id: "ssl", name: "SSLCOMMERZ", hint: "Cards, mobile banking & more", accent: "border-sky-500/40 bg-sky-500/8" },
  { id: "stripe", name: "Stripe", hint: "Visa, Mastercard & international cards", accent: "border-indigo-500/40 bg-indigo-500/8" },
]

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
  if (!expertSlug || !Number.isFinite(expertId) || !Number.isFinite(availabilitySlotId) || !date || !start || !end) {
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
