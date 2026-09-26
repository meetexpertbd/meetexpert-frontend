import type { Metadata } from "next"

import { LawyerClient } from "@/components/lawyer-client"

export const metadata: Metadata = {
  title: "Lawyers | MeetExpert",
  description:
    "Book private video consultations with verified lawyers for land, family, business, cyber, criminal and other legal matters in Bangladesh.",
}

export default function LawyerPage() {
  return <LawyerClient />
}
