"use client"

import * as React from "react"
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiError } from "@/lib/api-client"
import {
  fieldErrorsFromBody,
  submitContactMessage,
  type PreferredContactLanguage,
} from "@/lib/contact-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

const MESSAGE_MAX = 5000
const PHONE_MAX = 32

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "meetexpertbd@gmail.com",
    href: "mailto:meetexpertbd@gmail.com",
    desc: "Drop us a mail anytime",
    iconColor: "text-blue-500"
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+8801329640884",
    href: "https://wa.me/8801329640884",
    desc: "Chat instantly on WhatsApp",
    iconColor: "text-green-500"
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+8801329640884",
    href: "tel:+8801329640884",
    desc: "Call us for urgent support",
    iconColor: "text-cyan-500"
  },
  {
    icon: MapPin,
    label: "Address",
    value: "70/A Lake Circus, Kalabagan, Dhaka-1205, Bangladesh",
    href: "https://maps.google.com/?q=70/A+Lake+Circus,+Kalabagan,+Dhaka-1205,+Bangladesh",
    desc: "Visit our office, we’re happy to meet",
    iconColor: "text-orange-500"
  }
]

type FormState = {
  name: string
  phone: string
  email: string
  subject: string
  message: string
  preferred_language: "" | PreferredContactLanguage
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
  preferred_language: "",
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

export default function ContactPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [sent, setSent] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }))
  }, [user])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function resetForm() {
    setSent(false)
    setSuccessMessage("")
    setError(null)
    setFieldErrors({})
    setForm({
      ...emptyForm,
      name: user?.name ?? "",
      email: user?.email ?? "",
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      const res = await submitContactMessage(
        {
          name: form.name,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
          email: form.email || null,
          preferred_language: form.preferred_language || null,
        },
        token
      )
      setSuccessMessage(res.message || "Your message has been submitted. We will get back to you soon.")
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(fieldErrorsFromBody(err.body))
        if (err.status === 429) {
          setError("Too many messages. Please wait a minute and try again.")
        } else {
          setError(err.message || "Could not send your message.")
        }
      } else {
        setError(err instanceof Error ? err.message : "Could not send your message.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-border bg-muted/10 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We’re here to help. Reach out for support, suggestions, or just to say hello!
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow bg-white border border-primary/20">
              <CardContent className="p-6 sm:p-8">
                {sent ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-7" />
                    </div>
                    <p className="font-semibold text-lg text-foreground">Thanks for your message.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {successMessage}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-primary text-primary"
                      onClick={resetForm}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base text-primary">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your name"
                          required
                          maxLength={255}
                          aria-invalid={Boolean(fieldErrors.name)}
                          className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                        />
                        <FieldError message={fieldErrors.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-base text-primary">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          placeholder="01XXXXXXXXX"
                          required
                          maxLength={PHONE_MAX}
                          aria-invalid={Boolean(fieldErrors.phone)}
                          className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                        />
                        <FieldError message={fieldErrors.phone} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base text-primary">
                          Email <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          placeholder="you@example.com"
                          aria-invalid={Boolean(fieldErrors.email)}
                          className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                        />
                        <FieldError message={fieldErrors.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred_language" className="text-base text-primary">
                          Preferred language{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Select
                          id="preferred_language"
                          name="preferred_language"
                          value={form.preferred_language}
                          onChange={(e) =>
                            update(
                              "preferred_language",
                              e.target.value as FormState["preferred_language"]
                            )
                          }
                          aria-invalid={Boolean(fieldErrors.preferred_language)}
                          className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                        >
                          <option value="">Select language</option>
                          <option value="bn">বাংলা</option>
                          <option value="en">English</option>
                        </Select>
                        <FieldError message={fieldErrors.preferred_language} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-base text-primary">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        placeholder="What is this about?"
                        required
                        maxLength={255}
                        aria-invalid={Boolean(fieldErrors.subject)}
                        className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                      />
                      <FieldError message={fieldErrors.subject} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="message" className="text-base text-primary">Message</Label>
                        <span
                          className={cn(
                            "text-xs text-muted-foreground",
                            form.message.length > MESSAGE_MAX && "text-destructive"
                          )}
                        >
                          {form.message.length}/{MESSAGE_MAX}
                        </span>
                      </div>
                      <Textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        placeholder="Your message..."
                        rows={5}
                        required
                        maxLength={MESSAGE_MAX}
                        aria-invalid={Boolean(fieldErrors.message)}
                        className="rounded-md border bg-white focus:border-primary focus:ring-primary"
                      />
                      <FieldError message={fieldErrors.message} />
                    </div>
                    <Button
                      type="submit"
                      className="gap-2 bg-primary text-white hover:bg-primary/90 rounded-md shadow"
                      disabled={submitting}
                    >
                      <Send className="size-4" />
                      {submitting ? "Sending…" : "Send message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <h2 className="text-xl font-bold tracking-tight text-primary">
              Get in touch
            </h2>
            <div className="flex flex-col gap-5">
              {contactInfo.map((item) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.label}
                    className="shadow border border-primary/10 rounded-xl bg-white transition hover:shadow-md"
                  >
                    <CardContent className="flex gap-4 items-center p-5">
                      <div className={`flex size-12 items-center justify-center rounded-xl bg-primary/10 ${item.iconColor}`}>
                        <Icon className={`size-6 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.href}
                          target={item.label === "Address" ? "_blank" : undefined}
                          rel={item.label === "Address" ? "noopener noreferrer" : undefined}
                          className="font-semibold text-base break-all text-primary hover:underline"
                        >
                          {item.value}
                        </a>
                        <p className="text-xs mt-1 text-muted-foreground">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
