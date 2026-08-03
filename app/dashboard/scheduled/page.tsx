"use client"

import * as React from "react"
import { Loader2, Plus, Trash2, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useMutation } from "@/hooks"
import {
  emptyAvailabilityDays,
  fetchExpertAvailability,
  fetchExpertSlotPrice,
  normalizeAvailabilityDays,
  parseSlotPrice,
  saveExpertAvailability,
  saveExpertSlotPrice,
  type AvailabilityDay,
  type AvailabilitySlot,
  type ExpertAvailabilityInput,
  type ExpertSlotPriceInput,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? "00" : "30"
  return `${String(h).padStart(2, "0")}:${m}`
})

function formatTime12(value: string) {
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  let h = Number(m[1])
  const min = m[2]
  const period = h >= 12 ? "PM" : "AM"
  h = h % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, "0")}:${min} ${period}`
}

function timeOptionsFor(value: string) {
  if (!value || TIME_OPTIONS.includes(value)) return TIME_OPTIONS
  return [...TIME_OPTIONS, value].sort()
}

function addThirtyMinutes(value: string): string {
  const m = value.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return value
  const total = Number(m[1]) * 60 + Number(m[2]) + 30
  if (total >= 24 * 60) return "23:30"
  const h = Math.floor(total / 60)
  const min = total % 60
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
}

const emptySlot = (): AvailabilitySlot => ({ start: "07:00", end: "07:30" })

function ensureDaySlots(days: AvailabilityDay[]): AvailabilityDay[] {
  return days.map((d) =>
    d.enabled && d.slots.length === 0 ? { ...d, slots: [emptySlot()] } : d
  )
}

export default function ScheduledPage() {
  const token = useAuthStore((s) => s.token)
  const [days, setDays] = React.useState<AvailabilityDay[]>(emptyAvailabilityDays)
  const [slotPrice, setSlotPrice] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [priceSuccessMsg, setPriceSuccessMsg] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!token) {
      setLoading(false)
      setLoadError("Please sign in to manage your schedule.")
      return
    }
    setLoading(true)
    setLoadError(null)
    try {
      const [availabilityRes, priceRes] = await Promise.all([
        fetchExpertAvailability(token),
        fetchExpertSlotPrice(token).catch(() => null),
      ])
      setDays(ensureDaySlots(normalizeAvailabilityDays(availabilityRes.data)))
      const price = parseSlotPrice(priceRes?.data)
      setSlotPrice(price != null ? String(price) : "")
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load availability")
      setDays(emptyAvailabilityDays())
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    void load()
  }, [load])

  const { mutate, isLoading: saving, error: saveError } = useMutation(
    (input: ExpertAvailabilityInput) => saveExpertAvailability(token!, input),
    {
      onSuccess: (res) => {
        setDays(ensureDaySlots(normalizeAvailabilityDays(res.data)))
        setSuccessMsg(res.message || "Schedule saved.")
      },
    }
  )

  const {
    mutate: savePrice,
    isLoading: savingPrice,
    error: priceError,
  } = useMutation(
    (input: ExpertSlotPriceInput) => saveExpertSlotPrice(token!, input),
    {
      onSuccess: (res) => {
        const price = parseSlotPrice(res.data)
        if (price != null) setSlotPrice(String(price))
        setPriceSuccessMsg(res.message || "Slot price saved.")
      },
    }
  )

  function updateDay(dayOfWeek: number, patch: Partial<AvailabilityDay>) {
    setDays((prev) =>
      prev.map((d) => (d.day_of_week === dayOfWeek ? { ...d, ...patch } : d))
    )
    setSuccessMsg(null)
  }

  function toggleDay(dayOfWeek: number) {
    const day = days.find((d) => d.day_of_week === dayOfWeek)
    if (!day) return
    const enabled = !day.enabled
    updateDay(dayOfWeek, {
      enabled,
      slots: enabled && day.slots.length === 0 ? [emptySlot()] : day.slots,
    })
  }

  function updateSlot(
    dayOfWeek: number,
    index: number,
    field: "start" | "end",
    value: string
  ) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dayOfWeek) return d
        const slots = d.slots.map((s, i) => {
          if (i !== index) return s
          if (field === "start") {
            return { ...s, start: value, end: addThirtyMinutes(value) }
          }
          return { ...s, end: value }
        })
        return { ...d, slots }
      })
    )
    setSuccessMsg(null)
  }

  function addSlot(dayOfWeek: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dayOfWeek) return d
        if (d.slots.length >= 20) return d
        return { ...d, enabled: true, slots: [...d.slots, emptySlot()] }
      })
    )
    setSuccessMsg(null)
  }

  function removeSlot(dayOfWeek: number, index: number) {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day_of_week !== dayOfWeek) return d
        const slots = d.slots.filter((_, i) => i !== index)
        return {
          ...d,
          slots,
          enabled: slots.length > 0,
        }
      })
    )
    setSuccessMsg(null)
  }

  function handleSave() {
    if (!token) return
    setSuccessMsg(null)
    const payload: ExpertAvailabilityInput = {
      days: days.map((d) => ({
        day_of_week: d.day_of_week,
        enabled: d.enabled,
        slots: d.enabled
          ? d.slots.map(({ start, end }) => ({ start, end }))
          : [],
      })),
    }
    void mutate(payload).catch(() => {})
  }

  function handleSavePrice() {
    if (!token) return
    const value = Number(slotPrice)
    if (!Number.isFinite(value) || value < 0) {
      setPriceSuccessMsg(null)
      return
    }
    setPriceSuccessMsg(null)
    void savePrice({ slot_price: value }).catch(() => {})
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="slot-price" className="text-sm font-medium">
              Slot price
            </Label>
            <p className="text-sm text-muted-foreground">
              Set the price charged for each booking slot.
            </p>
            <div className="relative max-w-xs">
              <Input
                id="slot-price"
                type="number"
                min={0}
                step="1"
                inputMode="decimal"
                placeholder="e.g. 800"
                value={slotPrice}
                onChange={(e) => {
                  setSlotPrice(e.target.value)
                  setPriceSuccessMsg(null)
                }}
                className="pr-14"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                BDT
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleSavePrice}
            disabled={!token || savingPrice || slotPrice === ""}
            className="shrink-0"
          >
            {savingPrice ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {savingPrice ? "Saving…" : "Save price"}
          </Button>
        </div>
        {priceError && (
          <p className="mt-3 text-sm text-destructive">{priceError.message}</p>
        )}
        {priceSuccessMsg && (
          <p className="mt-3 text-sm text-green-700 dark:text-green-400">{priceSuccessMsg}</p>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scheduled Timings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set your weekly availability. Clients can book within these slots.
          </p>
        </div>
        <Button onClick={handleSave} disabled={!token || saving} className="shrink-0">
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving…" : "Save schedule"}
        </Button>
      </div>

      {loadError && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </p>
      )}
      {saveError && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveError.message}
        </p>
      )}
      {successMsg && (
        <p className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {successMsg}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {days.map((day, dayIndex) => {
          const slots = day.enabled ? day.slots : []
          const rows = day.enabled ? slots : [null]

          return rows.map((slot, slotIndex) => (
            <div
              key={`${day.day_of_week}-${slotIndex}`}
              className={cn(
                "flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5",
                dayIndex < days.length - 1 && slotIndex === rows.length - 1 && "border-b border-border"
              )}
            >
              {slotIndex === 0 ? (
                <div className="flex w-full shrink-0 items-center gap-3 sm:w-40">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.enabled}
                    aria-label={`Toggle ${DAY_LABELS[day.day_of_week]}`}
                    onClick={() => toggleDay(day.day_of_week)}
                    className={cn(
                      "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                      day.enabled ? "bg-primary" : "bg-muted-foreground/25"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                        day.enabled && "translate-x-5"
                      )}
                    />
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    {DAY_LABELS[day.day_of_week]}
                  </span>
                  {!day.enabled && (
                    <span
                      className="flex size-4 items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground"
                      title="This day is unavailable"
                    >
                      <Info className="size-2.5" />
                    </span>
                  )}
                </div>
              ) : (
                <div className="hidden shrink-0 sm:block sm:w-40" aria-hidden />
              )}

              <div className="min-w-0 flex-1">
                {!day.enabled || !slot ? (
                  <div className="flex h-11 items-center justify-center rounded-md border border-border bg-muted/40 text-sm text-muted-foreground">
                    Unavailable
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <label className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3">
                        <span className="shrink-0 text-sm text-muted-foreground">From</span>
                        <Select
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(day.day_of_week, slotIndex, "start", e.target.value)
                          }
                          className="h-auto flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          aria-label={`${DAY_LABELS[day.day_of_week]} from`}
                        >
                          {timeOptionsFor(slot.start).map((t) => (
                            <option key={t} value={t}>
                              {formatTime12(t)}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label className="flex h-11 items-center gap-2 rounded-md border border-border bg-background px-3">
                        <span className="shrink-0 text-sm text-muted-foreground">To</span>
                        <Select
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(day.day_of_week, slotIndex, "end", e.target.value)
                          }
                          className="h-auto flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          aria-label={`${DAY_LABELS[day.day_of_week]} to`}
                        >
                          {timeOptionsFor(slot.end).map((t) => (
                            <option key={t} value={t}>
                              {formatTime12(t)}
                            </option>
                          ))}
                        </Select>
                      </label>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => addSlot(day.day_of_week)}
                        disabled={day.slots.length >= 20}
                        className="flex size-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                        aria-label="Add time slot"
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlot(day.day_of_week, slotIndex)}
                        className="flex size-9 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Remove time slot"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        })}
      </div>
    </div>
  )
}
