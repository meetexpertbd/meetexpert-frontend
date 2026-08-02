"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ApiError } from "@/lib/api-client"
import {
  completeRegistration,
  resendRegisterOtp,
  verifyRegisterOtp,
} from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"

function VerifyPageContent() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const email = useAuthStore((s) => s.email)
  const setAuth = useAuthStore((s) => s.setAuth)
  const setEmail = useAuthStore((s) => s.setEmail)

  const [otpVerified, setOtpVerified] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [name, setName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = React.useState(0)

  React.useEffect(() => {
    if (isHydrated && token) {
      router.replace("/dashboard")
      return
    }
    if (isHydrated && !email) {
      router.replace("/login")
    }
  }, [isHydrated, token, email, router])

  React.useEffect(() => {
    if (!resendCooldown) return
    const t = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  if (!isHydrated || token || !email) return null

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || code.length < 4) return
    setError(null)
    setIsLoading(true)
    try {
      await verifyRegisterOtp(email, code)
      setOtpVerified(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || password !== passwordConfirmation) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await completeRegistration({
        email,
        name: name.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      if (!res.token) throw new Error(res.message || "No token returned")
      setAuth(res.token, res.user)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResend() {
    if (!email || resendCooldown > 0 || isLoading) return
    setError(null)
    setIsLoading(true)
    try {
      await resendRegisterOtp(email)
      setResendCooldown(60)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const maskedTo = email.replace(/(.{2}).*@(.*)/, "$1***@$2")

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <Link
            href="/"
            className="mb-6 flex items-center justify-center gap-2 text-foreground no-underline"
          >
            <Image src="/logopng.png" alt="" width={40} height={40} className="size-10" />
            <span className="text-xl font-semibold">Meet Expert</span>
          </Link>

          <h1 className="text-center text-2xl font-bold tracking-tight">
            {otpVerified ? "Complete registration" : "Verify your email"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {otpVerified
              ? "Create your name and password to finish signup."
              : `We sent a 4-digit code to ${maskedTo}.`}
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!otpVerified ? (
            <>
              <form onSubmit={handleOtpSubmit} className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="0000"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-12 text-center text-lg tracking-[0.5em]"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={isLoading || code.length < 4}
                >
                  {isLoading ? "Verifying..." : "Verify code"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>
            </>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full name</Label>
                <Input
                  id="reg-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-10"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-10 pr-10"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password-confirm">Confirm password</Label>
                <Input
                  id="reg-password-confirm"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-10"
                />
                {passwordConfirmation && password !== passwordConfirmation && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
              <Button
                type="submit"
                className="h-10 w-full"
                disabled={
                  isLoading ||
                  !name.trim() ||
                  password.length < 6 ||
                  password !== passwordConfirmation
                }
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

          <Link
            href="/login"
            onClick={() => setEmail(null)}
            className="mt-4 flex justify-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyPageContent />
    </React.Suspense>
  )
}
