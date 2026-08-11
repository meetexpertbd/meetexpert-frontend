"use client"

import * as React from "react"
import { getNameInitials, resolveAvatarUrl } from "@/lib/auth-api"
import { cn } from "@/lib/utils"

const sizeClass = {
  xs: "size-7 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
} as const

export function UserAvatar({
  name,
  src,
  size = "sm",
  className,
}: {
  name?: string | null
  src?: string | null
  size?: keyof typeof sizeClass
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)
  const url = resolveAvatarUrl(src)
  const initials = getNameInitials(name)

  React.useEffect(() => {
    setFailed(false)
  }, [url])

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold uppercase text-primary",
        sizeClass[size],
        className
      )}
      aria-hidden
    >
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
