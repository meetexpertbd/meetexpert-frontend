import { GraduationCap, HeartHandshake, Scale, type LucideIcon } from "lucide-react"

export type CategoryPage = {
  href: string
  label: string
  bn: string
  description: string
  icon: LucideIcon
  iconClass: string
  images: string[]
  imageAlt: string
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
    images: ["https://images.unsplash.com/photo-1764113697577-b5899b9a339d?w=800&h=1000&fit=crop"],
    imageAlt: "Statue of Lady Justice holding scales",
    match: /lawyer|legal|\blaw\b/i,
  },
  {
    href: "/study-abroad",
    label: "Study Abroad",
    bn: "বিদেশে পড়াশোনা",
    description: "Admission, scholarship, SOP, IELTS & visa",
    icon: GraduationCap,
    iconClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    images: ["https://images.unsplash.com/photo-1747509228690-8f1fef36d0bf?w=800&h=1000&fit=crop"],
    imageAlt: "Graduates throwing their caps in the air",
    match: /study\s*abroad|study-abroad|education/i,
  },
  {
    href: "/religious-scholar",
    label: "Religious Scholar",
    bn: "ধর্মীয় স্কলার",
    description: "Islam, Christianity, Hinduism & Buddhism",
    icon: HeartHandshake,
    iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    images: [
      "https://images.unsplash.com/photo-1589023025635-addd8d0392f8?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1705864821171-63fc75ee6c0e?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1764013649666-2405bb62b62f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1570000651176-f1fce849bf1d?w=400&h=500&fit=crop",
    ],
    imageAlt: "Mosque, church, Hindu altar and Buddhist shrine",
    match: /relig|scholar/i,
  },
]

export function categoryPageHref(category: { id: number; name: string; slug?: string | null }): string {
  const page = CATEGORY_PAGES.find((p) => p.match.test(category.name) || p.match.test(category.slug ?? ""))
  return page?.href ?? `/experts?category_id=${category.id}`
}
