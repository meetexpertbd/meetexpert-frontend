"use client"

import {
  Banknote,
  BriefcaseBusiness,
  Gavel,
  HardHat,
  Landmark,
  Lock,
  Plane,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react"

import { CategoryLanding, type LandingConfig } from "@/components/category-landing"

const LAWYER_CONFIG: LandingConfig = {
  categoryMatch: /lawyer|legal|\blaw\b/i,
  eyebrow: "Legal Experts",
  titleStart: "Clear legal advice,",
  titleHighlight: "without the court queue",
  titleEnd: "",
  bnSubtitle: "জমি, পরিবার, ব্যবসা বা যেকোনো আইনগত সমস্যায় অভিজ্ঞ আইনজীবীর পরামর্শ নিন।",
  description:
    "Book a private video consultation with verified advocates for land disputes, family matters, business, cyber crime and more, from anywhere in Bangladesh.",
  primaryCta: "Find a lawyer",
  joinCta: "Join as a lawyer",
  trust: [
    { icon: ShieldCheck, label: "Bar-verified" },
    { icon: Video, label: "1:1 video call" },
    { icon: Lock, label: "Confidential" },
  ],
  groups: [
    {
      key: "land",
      label: "Land & Property",
      bn: "জমি ও সম্পত্তি",
      slugs: ["land-property"],
      keywords: ["land", "property", "dolil", "mutation", "namjari"],
      tagline: "Deeds, mutation, inheritance and land dispute resolution.",
      topics: ["Dolil & deed check", "Namjari / mutation", "Inheritance", "Land disputes"],
      Icon: Landmark,
      tone: "emerald",
    },
    {
      key: "family",
      label: "Family & Marriage",
      bn: "পারিবারিক ও বিবাহ",
      slugs: ["family-marriage"],
      keywords: ["family", "marriage", "divorce", "custody", "den mohor"],
      tagline: "Sensitive support for marriage, divorce, custody and maintenance.",
      topics: ["Marriage registration", "Divorce", "Child custody", "Den mohor & maintenance"],
      Icon: Users,
      tone: "rose",
    },
    {
      key: "corporate",
      label: "Corporate & Business",
      bn: "ব্যবসা ও কর্পোরেট",
      slugs: ["corporate-business"],
      keywords: ["corporate", "business", "company", "contract", "trade license"],
      tagline: "Company formation, contracts and compliance for your business.",
      topics: ["Company registration", "Contracts", "Trade license", "Compliance"],
      Icon: BriefcaseBusiness,
      tone: "indigo",
    },
    {
      key: "cyber",
      label: "Cyber & Technology",
      bn: "সাইবার ও প্রযুক্তি",
      slugs: ["cyber-technology"],
      keywords: ["cyber", "digital", "online", "technology", "data"],
      tagline: "Online harassment, fraud, hacking and digital security law.",
      topics: ["Cyber harassment", "Online fraud", "Data protection", "Digital Security Act"],
      Icon: ShieldCheck,
      tone: "cyan",
    },
    {
      key: "criminal",
      label: "Criminal",
      bn: "ফৌজদারি",
      slugs: ["criminal"],
      keywords: ["criminal", "bail", "fir", "police"],
      tagline: "Bail, FIR/GD, police cases and criminal defence.",
      topics: ["Bail", "FIR / GD", "Criminal defence", "Police matters"],
      Icon: Gavel,
      tone: "red",
    },
    {
      key: "labour",
      label: "Labour & Employment",
      bn: "শ্রম ও চাকরি",
      slugs: ["labour-employment"],
      keywords: ["labour", "labor", "employment", "job", "salary"],
      tagline: "Workplace rights, termination, wages and service rules.",
      topics: ["Termination", "Unpaid wages", "Service rules", "Workplace rights"],
      Icon: HardHat,
      tone: "amber",
    },
    {
      key: "tax",
      label: "Tax & VAT",
      bn: "কর ও ভ্যাট",
      slugs: ["tax-vat"],
      keywords: ["tax", "vat", "return", "tin"],
      tagline: "Income tax returns, VAT registration and tax disputes.",
      topics: ["Tax return", "TIN / BIN", "VAT registration", "Tax disputes"],
      Icon: Receipt,
      tone: "violet",
    },
    {
      key: "banking",
      label: "Banking & Finance",
      bn: "ব্যাংকিং ও ফাইন্যান্স",
      slugs: ["banking-finance"],
      keywords: ["bank", "finance", "loan", "cheque"],
      tagline: "Loans, cheque dishonour cases and financial agreements.",
      topics: ["Loan disputes", "Cheque dishonour", "NI Act", "Financial agreements"],
      Icon: Banknote,
      tone: "teal",
    },
    {
      key: "immigration",
      label: "Immigration & Visa",
      bn: "ইমিগ্রেশন ও ভিসা",
      slugs: ["immigration-visa"],
      keywords: ["immigration", "visa", "passport", "citizenship"],
      tagline: "Visa refusals, immigration paperwork and citizenship.",
      topics: ["Visa refusal", "Work permit", "Citizenship", "Documentation"],
      Icon: Plane,
      tone: "sky",
    },
  ],
  tiles: [
    { groupKey: "criminal", image: "https://images.unsplash.com/photo-1764113697577-b5899b9a339d?w=600&h=800&fit=crop", alt: "Statue of Lady Justice holding scales" },
    { groupKey: "land", image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?w=600&h=800&fit=crop", alt: "Signing legal documents at a desk" },
    { groupKey: "family", image: "https://images.unsplash.com/photo-1632352926821-ce1f7a5f0a7f?w=600&h=800&fit=crop", alt: "Silhouette of a parent lifting a child at sunset" },
    { groupKey: "corporate", image: "https://images.unsplash.com/photo-1759310610325-2c7cb621e5e3?w=600&h=800&fit=crop", alt: "Business handshake in an office" },
  ],
  fallbackIcon: Scale,
  filterHeading: "What's your legal issue?",
  filterSub: "Pick a practice area to find the right advocate.",
  allLabel: "All areas",
  allBn: "সব বিষয়",
  itemPlural: "lawyers",
  searchPlaceholder: "Search by name, case type or language…",
  emptyTitle: "Lawyers are joining soon",
  emptyText: "We are verifying advocates for every practice area. Please check back shortly.",
  theme: {
    bg: "bg-[#0a1428]",
    pattern: (
      <svg className="absolute inset-0 -z-10 size-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="lawyer-pattern" width="48" height="96" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <line x1="8" y1="0" x2="8" y2="96" />
              <line x1="16" y1="0" x2="16" y2="96" />
              <path d="M0 12 H24 M0 84 H24" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lawyer-pattern)" />
      </svg>
    ),
    glows: [
      "-left-24 top-10 size-80 bg-blue-500/25",
      "-right-20 top-0 size-72 bg-amber-400/20",
      "bottom-0 left-1/3 size-72 bg-indigo-500/20",
      "-bottom-16 right-1/4 size-64 bg-yellow-500/15",
    ],
    eyebrow: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
    highlight: "bg-linear-to-r from-yellow-200 via-amber-300 to-yellow-500",
    primaryButton: "bg-yellow-400 text-slate-950 hover:bg-yellow-300",
    trustIcon: "text-yellow-300",
    tileShape: "rounded-2xl",
    focusRing: "focus-visible:ring-yellow-300",
  },
}

export function LawyerClient() {
  return <CategoryLanding config={LAWYER_CONFIG} />
}
