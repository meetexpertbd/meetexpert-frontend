import * as React from "react"

import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  action,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: "left" | "center"
  tone?: "default" | "dark"
  action?: React.ReactNode
  className?: string
}) {
  const dark = tone === "dark"
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            dark ? "border-white/15 bg-white/5 text-sky-200" : "border-primary/20 bg-primary/5 text-primary"
          )}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-4 text-3xl font-bold tracking-tight sm:text-4xl",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-3 text-sm leading-6 sm:text-base", dark ? "text-slate-300" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
