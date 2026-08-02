import Link from "next/link"
import { CheckCircle2, Users, Video, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { value: "5000+", label: "Consultations", icon: Video },
  { value: "200+", label: "Verified Experts", icon: Users },
  { value: "10+", label: "Countries", icon: Globe },
]

const values = [
  "Verified professionals only — every expert is vetted",
  "Secure video consultations from anywhere",
  "Transparent pricing with no hidden fees",
  "Support across law, study abroad, health, and more",
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About Expert
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We connect you with verified professionals for instant video consultation —
            lawyers, study abroad advisors, scholars, and more. Get trusted advice in minutes, not days.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Our Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Expert was built to make professional advice accessible to everyone. Whether you need
              legal guidance, help with study abroad applications, or a conversation with a scholar,
              we bring verified experts to your screen. No long waits, no travel — just clear,
              confidential consultations when you need them.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Why we do it</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Quality advice should be easy to find and easy to book. We vet every expert on our
              platform and keep the process simple: choose an expert, pick a time, and join a
              secure video or audio call. You get answers; experts get a fair way to share their
              expertise.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label}>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">What we stand for</h2>
          <ul className="mt-6 space-y-3">
            {values.map((v) => (
              <li key={v} className="flex items-start gap-3 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link href="/experts">Find an Expert</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
