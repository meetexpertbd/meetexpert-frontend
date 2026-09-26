"use client"

import * as React from "react"
import { Lock, ShieldCheck, Sparkles, Video } from "lucide-react"

import { CategoryLanding, type LandingConfig } from "@/components/category-landing"

type IconProps = { className?: string }

function CrescentStarIcon({ className }: IconProps) {
  const maskId = React.useId()
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle cx="15" cy="10" r="7" fill="black" />
      </mask>
      <circle cx="11" cy="12" r="9" mask={`url(#${maskId})`} />
      <polygon points="18.5,5.3 19.23,7.49 21.54,7.51 19.69,8.89 20.38,11.09 18.5,9.75 16.62,11.09 17.31,8.89 15.46,7.51 17.77,7.49" />
    </svg>
  )
}

function LatinCrossIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="10.5" y="2" width="3" height="20" rx="1" />
      <rect x="5" y="7" width="14" height="3" rx="1" />
    </svg>
  )
}

function OmIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <text x="12" y="19" textAnchor="middle" fontSize="20" fontWeight="700">
        ॐ
      </text>
    </svg>
  )
}

function DharmaWheelIcon({ className }: IconProps) {
  const pt = (r: number, a: number) => ({
    x: +(12 + r * Math.cos(a)).toFixed(2),
    y: +(12 + r * Math.sin(a)).toFixed(2),
  })
  const spokes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {spokes.map((a, i) => {
        const hub = pt(2, a)
        const rim = pt(7.5, a)
        const tip = pt(10, a)
        return (
          <g key={i}>
            <line x1={hub.x} y1={hub.y} x2={rim.x} y2={rim.y} />
            <line x1={rim.x} y1={rim.y} x2={tip.x} y2={tip.y} />
          </g>
        )
      })}
    </svg>
  )
}

const RELIGION_CONFIG: LandingConfig = {
  categoryMatch: /relig|scholar/i,
  eyebrow: "Religious Scholars",
  titleStart: "Guidance rooted in",
  titleHighlight: "faith",
  titleEnd: ", from scholars you can trust",
  bnSubtitle: "আপনার ধর্ম অনুযায়ী একজন বিশ্বস্ত স্কলারের সাথে ব্যক্তিগতভাবে কথা বলুন।",
  description:
    "Private one-to-one video sessions with verified scholars of Islam, Christianity, Hinduism and Buddhism, held with respect and complete confidentiality.",
  primaryCta: "Find a scholar",
  joinCta: "Join as a scholar",
  trust: [
    { icon: ShieldCheck, label: "Verified scholars" },
    { icon: Video, label: "1:1 video call" },
    { icon: Lock, label: "Fully private" },
  ],
  groups: [
    {
      key: "islam",
      label: "Islam",
      bn: "ইসলাম",
      resultLabel: "Islamic scholars",
      slugs: ["islamic-scholar"],
      keywords: ["islam", "muslim", "quran", "hadith", "fiqh"],
      tagline: "Guidance on Quran, Hadith, Fiqh and everyday Islamic life.",
      topics: ["Quran & Tafsir", "Hadith", "Fiqh & rulings", "Marriage & family"],
      Icon: CrescentStarIcon,
      tone: "emerald",
    },
    {
      key: "christianity",
      label: "Christianity",
      bn: "খ্রিস্টধর্ম",
      resultLabel: "Christian scholars",
      slugs: ["christian-scholar"],
      keywords: ["christ", "bible", "church", "gospel"],
      tagline: "Talk through scripture, faith questions and pastoral care.",
      topics: ["Bible study", "Prayer & faith", "Pastoral counselling", "Family life"],
      Icon: LatinCrossIcon,
      tone: "indigo",
    },
    {
      key: "hinduism",
      label: "Hinduism",
      bn: "হিন্দুধর্ম",
      resultLabel: "Hindu scholars",
      slugs: ["hindu-scholar"],
      keywords: ["hindu", "vedic", "veda", "gita", "sanatan", "puja"],
      tagline: "Learn about the Gita, Vedic tradition, rituals and puja.",
      topics: ["Bhagavad Gita", "Vedic studies", "Puja & rituals", "Life ceremonies"],
      Icon: OmIcon,
      tone: "orange",
    },
    {
      key: "buddhism",
      label: "Buddhism",
      bn: "বৌদ্ধধর্ম",
      resultLabel: "Buddhist scholars",
      slugs: ["buddhist-scholar"],
      keywords: ["buddh", "dhamma", "meditation", "sangha"],
      tagline: "Explore the Dhamma, meditation practice and mindful living.",
      topics: ["Dhamma teachings", "Meditation", "Mindful living", "Rituals & festivals"],
      Icon: DharmaWheelIcon,
      tone: "amber",
    },
  ],
  tiles: [
    { groupKey: "islam", image: "https://images.unsplash.com/photo-1589023025635-addd8d0392f8?w=600&h=800&fit=crop", alt: "Mosque with white domes in Dhaka" },
    { groupKey: "christianity", image: "https://images.unsplash.com/photo-1705864821171-63fc75ee6c0e?w=600&h=800&fit=crop", alt: "Candles glowing in front of a stained glass window" },
    { groupKey: "hinduism", image: "https://images.unsplash.com/photo-1764013649666-2405bb62b62f?w=600&h=800&fit=crop", alt: "Lit diya and incense on a Hindu altar" },
    { groupKey: "buddhism", image: "https://images.unsplash.com/photo-1570000651176-f1fce849bf1d?w=600&h=800&fit=crop", alt: "Golden Buddha statue in a monastery shrine" },
  ],
  fallbackIcon: Sparkles,
  filterHeading: "Choose your faith",
  filterSub: "Filter scholars by tradition, then book a private session.",
  allLabel: "All faiths",
  allBn: "সব ধর্ম",
  itemPlural: "scholars",
  searchPlaceholder: "Search by name, topic or language…",
  emptyTitle: "Scholars are joining soon",
  emptyText: "We are verifying scholars for every faith. Please check back shortly.",
  theme: {
    bg: "bg-[#0b1324]",
    pattern: (
      <svg className="absolute inset-0 -z-10 size-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="religion-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <rect x="16" y="16" width="32" height="32" />
              <rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)" />
              <circle cx="32" cy="32" r="8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#religion-pattern)" />
      </svg>
    ),
    glows: [
      "-left-24 top-10 size-80 bg-emerald-500/25",
      "-right-20 top-0 size-72 bg-indigo-500/25",
      "bottom-0 left-1/3 size-72 bg-orange-500/20",
      "-bottom-16 right-1/4 size-64 bg-amber-400/20",
    ],
    eyebrow: "border-amber-300/30 bg-amber-300/10 text-amber-200",
    highlight: "bg-linear-to-r from-amber-200 via-amber-300 to-orange-300",
    primaryButton: "bg-amber-400 text-slate-950 hover:bg-amber-300",
    trustIcon: "text-amber-300",
    tileShape: "rounded-t-full rounded-b-2xl",
    focusRing: "focus-visible:ring-amber-300",
  },
}

export function ReligiousScholarClient() {
  return <CategoryLanding config={RELIGION_CONFIG} />
}
