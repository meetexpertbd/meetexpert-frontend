"use client"

import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Compass,
  FileText,
  Globe,
  GraduationCap,
  Languages,
  MessagesSquare,
  Plane,
  Video,
  Wallet,
} from "lucide-react"

import { CategoryLanding, type LandingConfig } from "@/components/category-landing"

const STUDY_ABROAD_CONFIG: LandingConfig = {
  categoryMatch: /study\s*abroad|study-abroad|education/i,
  eyebrow: "Study Abroad",
  titleStart: "Your journey to a",
  titleHighlight: "global university",
  titleEnd: " starts here",
  bnSubtitle: "বিদেশে পড়াশোনার প্রতিটি ধাপে অভিজ্ঞ কনসালট্যান্টের ব্যক্তিগত গাইডলাইন নিন।",
  description:
    "Talk one-to-one with advisors who have helped students into universities in the UK, USA, Canada, Australia, Europe and beyond, from choosing a course to landing the visa.",
  primaryCta: "Find an advisor",
  joinCta: "Join as an advisor",
  trust: [
    { icon: BadgeCheck, label: "Verified advisors" },
    { icon: Video, label: "1:1 video call" },
    { icon: Wallet, label: "No agency fees" },
  ],
  groups: [
    {
      key: "admission",
      label: "University Admission",
      bn: "বিশ্ববিদ্যালয় ভর্তি",
      slugs: ["university-admission"],
      keywords: ["admission", "university", "college"],
      tagline: "Shortlist universities and build a strong application.",
      topics: ["University shortlist", "Eligibility check", "Application timeline", "Offer letters"],
      Icon: GraduationCap,
      tone: "sky",
    },
    {
      key: "visa",
      label: "Student Visa",
      bn: "স্টুডেন্ট ভিসা",
      slugs: ["student-visa"],
      keywords: ["student visa", "visa file", "cas", "i-20"],
      tagline: "Prepare a clean visa file with the right documents and funds.",
      topics: ["Document checklist", "Bank solvency", "CAS / I-20", "Visa refusal help"],
      Icon: Plane,
      tone: "indigo",
    },
    {
      key: "scholarship",
      label: "Scholarship & Funding",
      bn: "স্কলারশিপ ও ফান্ডিং",
      slugs: ["scholarship-funding"],
      keywords: ["scholarship", "funding", "tuition waiver", "assistantship"],
      tagline: "Find scholarships, assistantships and tuition waivers you can win.",
      topics: ["Fully funded", "Tuition waivers", "Assistantships", "Scholarship essays"],
      Icon: Award,
      tone: "amber",
    },
    {
      key: "sop",
      label: "SOP & Application",
      bn: "SOP ও আবেদন",
      slugs: ["sop-application"],
      keywords: ["sop", "statement of purpose", "lor", "cv"],
      tagline: "Write an SOP, CV and LORs that make admissions teams notice.",
      topics: ["SOP review", "Academic CV", "LOR guidance", "Personal statement"],
      Icon: FileText,
      tone: "violet",
    },
    {
      key: "english",
      label: "IELTS / PTE Prep",
      bn: "ইংরেজি টেস্ট প্রস্তুতি",
      slugs: ["english-test-preparation"],
      keywords: ["ielts", "pte", "toefl", "duolingo", "english"],
      tagline: "Plan your prep and hit the band score your course needs.",
      topics: ["IELTS", "PTE", "TOEFL", "Duolingo"],
      Icon: Languages,
      tone: "emerald",
    },
    {
      key: "planning",
      label: "Study Abroad Planning",
      bn: "পরিকল্পনা",
      slugs: ["study-abroad-planning"],
      keywords: ["planning", "country", "budget"],
      tagline: "Pick the right country, intake and budget for your goals.",
      topics: ["Country selection", "Intake planning", "Cost & budget", "Part-time work"],
      Icon: Globe,
      tone: "teal",
    },
    {
      key: "course",
      label: "Course & Career",
      bn: "কোর্স নির্বাচন",
      slugs: ["career-course-selection"],
      keywords: ["course", "subject", "program", "major"],
      tagline: "Choose a course that fits your background and career plan.",
      topics: ["Subject match", "Career outcomes", "Credit transfer", "Foundation options"],
      Icon: Compass,
      tone: "orange",
    },
    {
      key: "interview",
      label: "Visa Interview",
      bn: "ভিসা ইন্টারভিউ",
      slugs: ["visa-interview"],
      keywords: ["interview", "mock", "embassy"],
      tagline: "Practise with mock interviews and walk in confident.",
      topics: ["Mock interview", "Common questions", "Embassy tips", "Confidence building"],
      Icon: MessagesSquare,
      tone: "rose",
    },
    {
      key: "career",
      label: "Post-study Career",
      bn: "পড়াশোনার পরের ক্যারিয়ার",
      slugs: ["post-study-career"],
      keywords: ["post-study", "psw", "opt", "work permit", "pr"],
      tagline: "Plan work permits, jobs and PR pathways after graduation.",
      topics: ["PSW / OPT", "Job search", "Work permit", "PR pathways"],
      Icon: BriefcaseBusiness,
      tone: "cyan",
    },
  ],
  tiles: [
    { groupKey: "admission", image: "https://images.unsplash.com/photo-1760111085279-6c4b6d831acc?w=600&h=800&fit=crop", alt: "Students walking through a university archway" },
    { groupKey: "visa", image: "https://images.unsplash.com/photo-1741795820235-a0e96e4ff6e4?w=600&h=800&fit=crop", alt: "Hands holding a passport and boarding pass" },
    { groupKey: "scholarship", image: "https://images.unsplash.com/photo-1747509228690-8f1fef36d0bf?w=600&h=800&fit=crop", alt: "Graduates throwing their caps in the air" },
    { groupKey: "english", image: "https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?w=600&h=800&fit=crop", alt: "Student studying on a laptop in a university library" },
  ],
  fallbackIcon: GraduationCap,
  filterHeading: "Where do you need help?",
  filterSub: "Choose a step of your journey to find the right advisor.",
  allLabel: "All services",
  allBn: "সব সেবা",
  itemPlural: "advisors",
  searchPlaceholder: "Search by name, country or service…",
  emptyTitle: "Advisors are joining soon",
  emptyText: "We are verifying study abroad advisors. Please check back shortly.",
  theme: {
    bg: "bg-[#06182e]",
    pattern: (
      <svg className="absolute inset-0 -z-10 size-full opacity-[0.08]" aria-hidden>
        <defs>
          <pattern id="study-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeWidth="1">
              <circle cx="60" cy="60" r="40" />
              <ellipse cx="60" cy="60" rx="16" ry="40" />
              <path d="M20 60 H100 M26 40 H94 M26 80 H94" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#study-pattern)" />
      </svg>
    ),
    glows: [
      "-left-24 top-10 size-80 bg-sky-500/25",
      "-right-20 top-0 size-72 bg-violet-500/25",
      "bottom-0 left-1/3 size-72 bg-teal-400/20",
      "-bottom-16 right-1/4 size-64 bg-amber-400/15",
    ],
    eyebrow: "border-sky-300/30 bg-sky-300/10 text-sky-200",
    highlight: "bg-linear-to-r from-sky-200 via-cyan-300 to-teal-300",
    primaryButton: "bg-sky-400 text-slate-950 hover:bg-sky-300",
    trustIcon: "text-sky-300",
    tileShape: "rounded-[2rem]",
    focusRing: "focus-visible:ring-sky-300",
  },
}

export function StudyAbroadClient() {
  return <CategoryLanding config={STUDY_ABROAD_CONFIG} />
}
