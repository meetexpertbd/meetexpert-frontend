import type { Metadata } from "next"

import { StudyAbroadClient } from "@/components/study-abroad-client"

export const metadata: Metadata = {
  title: "Study Abroad Advisors | MeetExpert",
  description:
    "Get one-to-one guidance on university admission, scholarships, SOP, IELTS/PTE and student visas from verified study abroad advisors.",
}

export default function StudyAbroadPage() {
  return <StudyAbroadClient />
}
