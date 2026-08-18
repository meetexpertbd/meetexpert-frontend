"use client"

import * as React from "react"
import Link from "next/link"
import { BadgeCheck, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  PLACEHOLDER_AVATAR,
  expertProfileHref,
  formatSlotPrice,
  type ExpertItem,
} from "@/lib/experts-data"
import { cn } from "@/lib/utils"

function VerifiedHint() {
  const [open, setOpen] = React.useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-expanded={open}
      >
        <BadgeCheck className="size-3.5" />
        Verified
      </button>
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-border bg-popover p-3 text-left text-xs text-popover-foreground shadow-md">
          <p className="font-semibold">Why verified?</p>
          <ul className="mt-1.5 space-y-1 text-muted-foreground">
            <li>Identity reviewed</li>
            <li>Qualification reviewed</li>
            <li>Professional experience reviewed</li>
          </ul>
        </span>
      )}
    </span>
  )
}

export function ExpertCard({
  expert,
  className,
  compact = false,
}: {
  expert: ExpertItem
  className?: string
  compact?: boolean
}) {
  const [imgFailed, setImgFailed] = React.useState(false)
  const src = !imgFailed && expert.image ? expert.image : PLACEHOLDER_AVATAR
  const price = formatSlotPrice(expert.slotPrice)
  const href = expertProfileHref(expert)
  const languages = expert.languages.slice(0, 3)

  React.useEffect(() => {
    setImgFailed(false)
  }, [expert.image])

  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className={cn("relative w-full shrink-0 overflow-hidden bg-muted", compact ? "h-44" : "aspect-4/3")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={expert.name}
          className="size-full object-cover"
          onError={() => {
            if (src !== PLACEHOLDER_AVATAR) setImgFailed(true)
          }}
        />
        {expert.yearsExperience > 0 && (
          <Badge variant="secondary" className="absolute right-2 top-2 text-xs backdrop-blur-sm">
            {expert.yearsExperience}+ yrs
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
        {expert.category && (
          <Badge variant="outline" className="w-fit max-w-full truncate text-xs">
            {expert.category}
          </Badge>
        )}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold leading-snug text-foreground">
            {expert.name}
          </h3>
          <VerifiedHint />
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {expert.headline || expert.subcategory || expert.bio}
        </p>
        {(expert.rating != null && expert.rating > 0) || (expert.sessions != null && expert.sessions > 0) ? (
          <p className="text-xs text-muted-foreground">
            {expert.rating != null && expert.rating > 0 ? `★ ${expert.rating}` : null}
            {expert.rating != null && expert.rating > 0 && expert.sessions ? " · " : null}
            {expert.sessions != null && expert.sessions > 0 ? `${expert.sessions} sessions` : null}
          </p>
        ) : null}
        {languages.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">{languages.join(" · ")}</p>
        )}
        {(price || expert.duration) && (
          <p className="mt-auto text-sm font-semibold text-foreground">
            {[expert.duration, price].filter(Boolean).join(" · ")}
          </p>
        )}
      </CardContent>
      <CardFooter className="mt-auto shrink-0 gap-2 border-t border-border/70 p-4">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link href={href}>View Profile</Link>
        </Button>
        <Button size="sm" className="flex-1 gap-1.5" asChild>
          <Link href={href}>
            <Video className="size-4" />
            Book
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
