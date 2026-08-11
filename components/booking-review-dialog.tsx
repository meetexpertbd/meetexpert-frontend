"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ApiError } from "@/lib/api-client"
import {
  createBookingReview,
  updateBookingReview,
  type BookingReview,
} from "@/lib/expert-api"
import { cn } from "@/lib/utils"

function useIsDesktop(breakpoint = "(min-width: 768px)") {
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia(breakpoint)
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])

  return isDesktop
}

export function RatingStars({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number
  onChange?: (rating: number) => void
  size?: "sm" | "md"
  readOnly?: boolean
}) {
  const [hover, setHover] = React.useState(0)
  const shown = hover || value
  const iconClass = size === "sm" ? "size-4" : "size-7"

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${value} out of 5`}
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1
        const filled = n <= shown
        if (readOnly) {
          return (
            <Star
              key={n}
              className={cn(
                iconClass,
                filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          )
        }
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange?.(n)}
            className="rounded-sm p-0.5 transition-transform hover:scale-110"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={cn(
                iconClass,
                filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

function messageFromError(e: unknown): string {
  if (e instanceof ApiError) {
    const body = e.body
    if (body && typeof body === "object" && "errors" in body) {
      const errors = (body as { errors?: Record<string, string[] | string> }).errors
      const first = errors
        ? Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [v]))[0]
        : null
      if (first) return first
    }
    return e.message
  }
  if (e instanceof Error) return e.message
  return "Could not save review."
}

type ReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  bookingId: number
  expertName?: string
  review?: BookingReview | null
  readOnly?: boolean
  onSaved: (review: BookingReview) => void
}

export function BookingReviewDialog({
  open,
  onOpenChange,
  token,
  bookingId,
  expertName,
  review,
  readOnly = false,
  onSaved,
}: ReviewDialogProps) {
  const isDesktop = useIsDesktop()
  const isEdit = Boolean(review)
  const [rating, setRating] = React.useState(review?.rating ?? 0)
  const [comment, setComment] = React.useState(review?.comment ?? "")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setRating(review?.rating ?? 0)
    setComment(review?.comment ?? "")
    setError(null)
    setSaving(false)
  }, [open, review])

  const title = readOnly
    ? "Session review"
    : isEdit
      ? "Edit review"
      : "Write a review"
  const description = readOnly
    ? `Review for ${expertName ?? "this session"}`
    : `How was your session${expertName ? ` with ${expertName}` : ""}?`

  const handleSave = async () => {
    if (readOnly || rating < 1) return
    setSaving(true)
    setError(null)
    try {
      const input = { rating, comment: comment.trim() || null }
      const res = isEdit
        ? await updateBookingReview(token, bookingId, input)
        : await createBookingReview(token, bookingId, input)
      if (res.data) onSaved(res.data)
      onOpenChange(false)
    } catch (e) {
      setError(messageFromError(e))
    } finally {
      setSaving(false)
    }
  }

  const body = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rating</Label>
        <RatingStars value={rating} onChange={setRating} readOnly={readOnly} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="booking-review-comment">Comment</Label>
        {readOnly ? (
          <p className="text-sm text-muted-foreground">
            {comment.trim() || "No comment left."}
          </p>
        ) : (
          <Textarea
            id="booking-review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Share how the session went (optional)"
          />
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!readOnly && (
        <Button
          type="button"
          className="w-full"
          disabled={rating < 1 || saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : isEdit ? "Update review" : "Submit review"}
        </Button>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {body}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-hidden">
        <DrawerHeader className="shrink-0">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{body}</div>
      </DrawerContent>
    </Drawer>
  )
}
