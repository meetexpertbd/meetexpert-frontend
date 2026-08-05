"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const SIZE_MAP = {
  sm: { box: "size-6", stroke: 4, text: "text-[8px]" },
  md: { box: "size-12", stroke: 3.5, text: "text-xs" },
  lg: { box: "size-16", stroke: 4, text: "text-sm" },
  xl: { box: "size-20", stroke: 4.5, text: "text-base" },
} as const

type ProgressLoaderSize = keyof typeof SIZE_MAP

type ProgressLoaderProps = {
  className?: string
  size?: ProgressLoaderSize
  label?: string
  active?: boolean
  /** ms for one 0→100 cycle while loading */
  duration?: number
}

export function ProgressLoader({
  className,
  size = "md",
  label,
  active = true,
  duration = 1800,
}: ProgressLoaderProps) {
  const [progress, setProgress] = React.useState(0)
  const cfg = SIZE_MAP[size]
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  React.useEffect(() => {
    if (!active) {
      setProgress(0)
      return
    }

    setProgress(0)
    let frame = 0
    let cycleStart = performance.now()

    const tick = (now: number) => {
      const elapsed = now - cycleStart
      const next = Math.round((elapsed / duration) * 100)
      if (next >= 100) {
        setProgress(100)
        setTimeout(() => {
          cycleStart = performance.now()
          setProgress(0)
        }, 120)
      } else {
        setProgress(next)
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, duration])

  return (
    <div
      className={cn("inline-flex flex-col items-center justify-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? `Loading ${progress}%`}
    >
      <div className={cn("relative", cfg.box)}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={cfg.stroke}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className="stroke-primary transition-[stroke-dashoffset] duration-75"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-semibold tabular-nums text-foreground",
            cfg.text
          )}
        >
          {progress}%
        </span>
      </div>
      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : null}
    </div>
  )
}

export function ProgressLoaderScreen({
  className,
  label,
  size = "lg",
}: {
  className?: string
  label?: string
  size?: ProgressLoaderSize
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] w-full flex-col items-center justify-center",
        className
      )}
    >
      <ProgressLoader size={size} label={label} />
    </div>
  )
}
