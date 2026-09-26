import { GraduationCap, HeartHandshake, Scale, type LucideIcon } from "lucide-react"

export type CategoryPage = {
  href: string
  label: string
  bn: string
  description: string
  icon: LucideIcon
  iconClass: string
  match: RegExp
}

export const CATEGORY_PAGES: CategoryPage[] = [
  {
    href: "/lawyer",
    label: "Lawyer",
    bn: "আইনজীবী",
    description: "Land, family, business, cyber & criminal law",
    icon: Scale,
    iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    match: /lawyer|legal|\blaw\b/i,
  },
  {
    href: "/study-abroad",
    label: "Study Abroad",
    bn: "বিদেশে পড়াশোনা",
    description: "Admission, scholarship, SOP, IELTS & visa",
    icon: GraduationCap,
    iconClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    match: /study\s*abroad|study-abroad|education/i,
  },
  {
    href: "/religious-scholar",
    label: "Religious Scholar",
    bn: "ধর্মীয় স্কলার",
    description: "Islam, Christianity, Hinduism & Buddhism",
    icon: HeartHandshake,
    iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    match: /relig|scholar/i,
  },
]

export function categoryPageHref(category: { id: number; name: string; slug?: string | null }): string {
  const page = CATEGORY_PAGES.find((p) => p.match.test(category.name) || p.match.test(category.slug ?? ""))
  return page?.href ?? `/experts?category_id=${category.id}`
}
