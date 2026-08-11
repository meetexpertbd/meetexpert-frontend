"use client"

import * as React from "react"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
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
  { icon: Mail, label: "Email", value: "support@expert.com" },
  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
  { icon: MapPin, label: "Address", value: "123 Expert Street, City, Country" },
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
      <section className="border-b border-border bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or feedback? Send us a message and we&apos;ll get back to you soon.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 sm:p-8">
                {sent ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-7" />
                    </div>
                    <p className="font-medium text-foreground">Thanks for your message.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {successMessage}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
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
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Your name"
                          required
                          maxLength={255}
                          aria-invalid={Boolean(fieldErrors.name)}
                        />
                        <FieldError message={fieldErrors.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
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
                        />
                        <FieldError message={fieldErrors.phone} />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">
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
                        />
                        <FieldError message={fieldErrors.email} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred_language">
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
                        >
                          <option value="">Select language</option>
                          <option value="bn">বাংলা</option>
                          <option value="en">English</option>
                        </Select>
                        <FieldError message={fieldErrors.preferred_language} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        placeholder="What is this about?"
                        required
                        maxLength={255}
                        aria-invalid={Boolean(fieldErrors.subject)}
                      />
                      <FieldError message={fieldErrors.subject} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="message">Message</Label>
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
                      />
                      <FieldError message={fieldErrors.message} />
                    </div>
                    <Button type="submit" className="gap-2" disabled={submitting}>
                      <Send className="size-4" />
                      {submitting ? "Sending…" : "Send message"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Get in touch</h2>
            {contactInfo.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.label}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
