import { notFound } from "next/navigation"
import { ExpertProfileClient } from "@/components/expert-profile-client"
import { getExpertDetail } from "@/lib/expert-detail-data"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ExpertDetailsPage({ params }: PageProps) {
  const { slug } = await params
  const expert = await getExpertDetail(slug)
  if (!expert) notFound()
  return <ExpertProfileClient expert={expert} />
}
