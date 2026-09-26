import { Hero } from "@/components/hero"
import { CategoryShowcase } from "@/components/category-showcase"
import { FeatureExperts } from "@/components/feature-experts"
import { HowVerified } from "@/components/how-verified"
import HowItWork from "@/components/HowItWork"
import WhyChooseUs from "@/components/WhyChooseUs"
import UserReview from "@/components/user-review"
import FAQ from "@/components/faq"
import { FinalCta } from "@/components/final-cta"

export default function Page() {
  return (
    <main>
      <Hero />
      <FeatureExperts />
      <CategoryShowcase />
      <HowItWork />
      <WhyChooseUs />
      <HowVerified />
      <UserReview />
      <FAQ />
      <FinalCta />
    </main>
  )
}
