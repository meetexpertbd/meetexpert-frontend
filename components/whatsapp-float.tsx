"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const AGENTS = [
  {
    name: "Nusrat Jahan",
    photo: "https://images.unsplash.com/photo-1639325723423-988010881cd7?w=160&h=160&fit=facearea&facepad=2.5",
  },
  {
    name: "Tanvir Ahmed",
    photo: "https://images.unsplash.com/photo-1589386417686-0d34b5903d23?w=160&h=160&fit=facearea&facepad=2.5",
  },
  {
    name: "Farhana Akter",
    photo: "https://images.unsplash.com/photo-1750231413230-9870c277a42f?w=160&h=160&fit=facearea&facepad=2.5",
  },
  {
    name: "Rafiul Islam",
    photo: "https://images.unsplash.com/photo-1644269444230-c6d1f2722e10?w=160&h=160&fit=facearea&facepad=2.5",
  },
]

const ROTATE_MS = 3000

export function WhatsappFloat() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801329640884"
  const number = rawNumber.replace(/\D/g, "")
  const href = `https://wa.me/${number}`

  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive((i) => (i + 1) % AGENTS.length), ROTATE_MS)
    return () => clearInterval(id)
  }, [paused])

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${AGENTS[active].name} on WhatsApp`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="hidden items-center rounded-2xl rounded-br-sm border border-border bg-card/95 py-2 pl-3.5 pr-4 shadow-lg backdrop-blur transition-all duration-300 group-hover:-translate-x-0.5 group-hover:shadow-xl sm:flex">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Chat with
          </span>
          <span className="relative block h-5 w-28 overflow-hidden">
            {AGENTS.map((agent, i) => (
              <span
                key={agent.name}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 truncate text-sm font-semibold text-foreground transition-all duration-500 ease-out motion-reduce:transition-none",
                  i === active
                    ? "translate-y-0 opacity-100 blur-0"
                    : "translate-y-3 opacity-0 blur-[2px]"
                )}
              >
                {agent.name}
              </span>
            ))}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Online now
          </span>
        </div>
      </div>

      <div className="relative size-14 shrink-0 transition-transform duration-300 group-hover:scale-105">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/30 animation-duration-[2.5s] motion-reduce:animate-none" />
        <div className="relative size-full overflow-hidden rounded-full bg-muted shadow-lg ring-[3px] ring-emerald-500 ring-offset-2 ring-offset-background">
          {AGENTS.map((agent, i) => (
            <Image
              key={agent.photo}
              src={agent.photo}
              alt={i === active ? agent.name : ""}
              fill
              sizes="56px"
              priority={i === 0}
              className={cn(
                "object-cover transition-all duration-700 ease-out motion-reduce:transition-none",
                i === active ? "scale-100 opacity-100" : "scale-110 opacity-0"
              )}
            />
          ))}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-background dark:bg-emerald-500">
          <MessageCircle className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  )
}
