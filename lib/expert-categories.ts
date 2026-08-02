export const EXPERT_CATEGORIES = {
  Legal: ["Lawyer", "Immigration Lawyer", "Family Lawyer", "Corporate Lawyer"],
  Education: ["Study Abroad Consultant", "IELTS Mentor", "Career Advisor", "Tutor"],
  Religion: ["Islamic Scholar", "Quran Teacher", "Spiritual Counselor"],
  Health: ["Psychologist", "Nutritionist", "General Physician", "Counselor"],
  Business: ["Startup Mentor", "Marketing Consultant", "Finance Advisor"],
  Technology: ["Software Engineer", "UI/UX Expert", "AI Consultant", "Data Analyst"],
  Others: ["Life Coach", "Fitness Trainer", "Language Expert"],
} as const

export type CategoryKey = keyof typeof EXPERT_CATEGORIES
export type SubcategoryMap = typeof EXPERT_CATEGORIES

export function getSubcategories(category: string): string[] {
  if (category in EXPERT_CATEGORIES) {
    return [...EXPERT_CATEGORIES[category as CategoryKey]]
  }
  return []
}

export const CATEGORY_LABELS = Object.keys(EXPERT_CATEGORIES) as CategoryKey[]

export const CATEGORIES_GRID = [
  { label: "Legal", items: ["Lawyer", "Immigration Lawyer", "Family Lawyer"] },
  { label: "Education", items: ["Study Abroad Consultant", "IELTS Mentor", "Career Advisor"] },
  { label: "Religion", items: ["Islamic Scholar", "Quran Teacher"] },
  { label: "Health", items: ["Psychologist", "Nutritionist"] },
  { label: "Business", items: ["Startup Mentor", "Marketing Consultant"] },
  { label: "Technology", items: ["Software Engineer", "UI/UX Expert", "AI Consultant"] },
] as const
