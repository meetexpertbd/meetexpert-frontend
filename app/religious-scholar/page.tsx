import type { Metadata } from "next"

import { ReligiousScholarClient } from "@/components/religious-scholar-client"

export const metadata: Metadata = {
  title: "Religious Scholars | MeetExpert",
  description:
    "Book private video sessions with verified scholars of Islam, Christianity, Hinduism and Buddhism.",
}

export default function ReligiousScholarPage() {
  return <ReligiousScholarClient />
}
