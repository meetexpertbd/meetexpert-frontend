import { Hero } from "@/components/hero"
import { FeatureExperts } from "@/components/feature-experts"
import HowItWork from "@/components/HowItWork"
import WhyChooseUs from "@/components/WhyChooseUs"
import UserReview from "@/components/user-review"
import FAQ from "@/components/faq"

export default function Page() {
  return (
    <main>
      <Hero />
      <FeatureExperts />
      <HowItWork />
      <WhyChooseUs />
      <UserReview />
      <FAQ />
    </main>
  )
}
