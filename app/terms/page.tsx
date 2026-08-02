import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-foreground mt-8 first:mt-0">1. Acceptance</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            By using Meet Expert (&quot;the platform&quot;), you agree to these Terms of Service. If you do not
            agree, do not use the service. We may change these terms; we will notify you of
            material changes by posting the updated terms and updating the &quot;Last updated&quot; date.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. Use of the service</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            The platform connects users with verified experts for video or audio consultations. You
            must use the service lawfully and in line with these terms. You may not misuse the
            platform, harass experts or other users, or attempt to circumvent our systems or fees.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. Accounts</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            You may need to create an account to book consultations. You are responsible for
            keeping your login details secure and for all activity under your account. You must
            provide accurate information and update it when it changes.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Bookings and payments</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            When you book a session, you agree to pay the stated fee. Payment is processed through
            our payment providers. Cancellation and refund rules are shown at the time of booking.
            We may change pricing with notice; existing bookings are honored at the booked price.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">5. Expert advice</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Advice given by experts on the platform is for general guidance only and does not
            replace professional advice in regulated fields (e.g. legal or medical) where a formal
            engagement is required. You use such advice at your own discretion.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">6. Limitation of liability</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            To the extent permitted by law, Meet Expert and its affiliates are not liable for indirect,
            incidental, or consequential damages arising from your use of the platform or any
            advice received. Our total liability is limited to the amount you paid for the
            relevant booking in the past twelve months.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">7. Termination</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We may suspend or terminate your access if you breach these terms or for other
            operational or legal reasons. You may stop using the service at any time. Provisions
            that by their nature should survive (e.g. liability, disputes) will remain in effect.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">8. Governing law</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            These terms are governed by the laws of the jurisdiction in which Meet Expert operates.
            Disputes will be resolved in the courts of that jurisdiction, unless otherwise
            required by law.
          </p>

          <p className="mt-10 text-sm text-muted-foreground">
            For questions about these Terms of Service, please{" "}
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </article>
    </div>
  )
}
