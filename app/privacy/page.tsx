import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2 className="text-xl font-semibold text-foreground mt-8 first:mt-0">1. Information we collect</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We collect information you provide when you register, book a consultation, or contact us.
            This may include your name, email address, payment details, and any messages or files you
            send through the platform. We also collect usage data such as how you use the site and
            device information to improve our services.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">2. How we use your information</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We use your information to provide and improve our services, process bookings and
            payments, communicate with you, and ensure security and compliance. We may send you
            service-related emails or updates about your account. We do not sell your personal
            information to third parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">3. Cookies and tracking</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to keep you signed in, remember your preferences,
            and understand how the site is used. You can control cookies through your browser
            settings, though some features may not work correctly if you disable them.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">4. Data sharing</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We may share your information with experts you book, payment processors, and service
            providers that help us run the platform. We may also disclose data when required by law
            or to protect our rights and safety. We do not sell or rent your data to marketers.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">5. Security</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We take reasonable steps to protect your data using encryption, access controls, and
            secure infrastructure. No method of transmission over the internet is fully secure; we
            encourage you to use a strong password and keep your account details private.
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">6. Your rights</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Depending on where you live, you may have the right to access, correct, or delete your
            data, or to object to or restrict certain processing. To exercise these rights or ask
            questions about your data, contact us at{" "}
            <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
              our contact page
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-foreground mt-8">7. Changes</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            We may update this policy from time to time. We will post the revised policy on this
            page and update the &quot;Last updated&quot; date. Continued use of the service after changes
            constitutes acceptance of the updated policy.
          </p>

          <p className="mt-10 text-sm text-muted-foreground">
            For questions about this Privacy Policy, please{" "}
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
