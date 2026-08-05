"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressLoader } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import {
  checkEmail,
  forgotPassword,
  loginWithPassword,
  resendForgotPasswordOtp,
  resetPassword,
  verifyForgotPasswordOtp,
} from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth-store"

type Step = "email" | "password" | "forgot-otp" | "forgot-reset"

function safeRedirectPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null
  return raw
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get("redirect")) ?? "/dashboard"
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const email = useAuthStore((s) => s.email)
  const setEmail = useAuthStore((s) => s.setEmail)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep] = React.useState<Step>("email")
  const [value, setValue] = React.useState(email ?? "")
  const [password, setPassword] = React.useState("")
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = React.useState(0)

  React.useEffect(() => {
    if (isHydrated && token) router.replace(redirectTo)
  }, [isHydrated, token, router, redirectTo])

  React.useEffect(() => {
    if (!resendCooldown) return
    const t = setInterval(() => setResendCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  if (!isHydrated || token) return null

  function resetToEmail() {
    setStep("email")
    setPassword("")
    setPasswordConfirmation("")
    setOtp("")
    setError(null)
    setSuccess(null)
    setEmail(null)
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)
    try {
      const nextEmail = value.trim()
      const res = await checkEmail(nextEmail)
      const action = res.data?.action
      setEmail(nextEmail)
      if (action === "register") {
        const q = redirectTo !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
        router.push(`/login/verify${q}`)
        return
      }
      if (action === "login") {
        setStep("password")
        return
      }
      setError(res.message || "Unexpected response")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await loginWithPassword(email, password)
      if (!res.token) throw new Error(res.message || "No token returned")
      setAuth(res.token, res.user)
      router.replace(redirectTo)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotStart() {
    const target = (email ?? value).trim()
    if (!target) return
    setError(null)
    setSuccess(null)
    setIsLoading(true)
    try {
      const res = await forgotPassword(target)
      setEmail(target)
      setStep("forgot-otp")
      setOtp("")
      setPassword("")
      setPasswordConfirmation("")
      setResendCooldown(60)
      setSuccess(res.message || "OTP sent to your email.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || otp.length < 4) return
    setError(null)
    setIsLoading(true)
    try {
      await verifyForgotPasswordOtp(email, otp)
      setStep("forgot-reset")
      setPassword("")
      setPasswordConfirmation("")
      setSuccess("OTP verified. Set your new password.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotResend() {
    if (!email || resendCooldown > 0 || isLoading) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await resendForgotPasswordOtp(email)
      setResendCooldown(60)
      setSuccess(res.message || "OTP resent to your email.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || password !== passwordConfirmation) return
    setError(null)
    setIsLoading(true)
    try {
      const res = await resetPassword({
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setStep("password")
      setPassword("")
      setPasswordConfirmation("")
      setOtp("")
      setSuccess(res.message || "Password reset successful. Sign in.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const maskedEmail = email
    ? email.replace(/(.{2}).*@(.*)/, "$1***@$2")
    : "your email"

  const title =
    step === "forgot-reset"
      ? "Reset password"
      : step === "forgot-otp"
        ? "Verify reset code"
        : step === "password"
          ? "Welcome back"
          : "Sign in"

  const subtitle =
    step === "forgot-reset"
      ? "Choose a new password for your account."
      : step === "forgot-otp"
        ? `We sent a 4-digit code to ${maskedEmail}.`
        : step === "password"
          ? "Enter your password to continue."
          : "Enter your email. We will log you in or send a code to register."

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

          <h1 className="text-center text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{subtitle}</p>

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {success}
            </p>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-10 pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="h-10 w-full" disabled={isLoading || !value.trim()}>
                {isLoading ? (
                  <>
                    <ProgressLoader size="sm" />
                    Checking...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email ?? ""} disabled className="h-10 bg-muted/40" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotStart}
                    disabled={isLoading}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    className="h-10 pr-10"
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
              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isLoading || password.length < 6}
              >
                {isLoading ? (
                  <>
                    <ProgressLoader size="sm" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <button
                type="button"
                onClick={resetToEmail}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Use a different email
              </button>
            </form>
          )}

          {step === "forgot-otp" && (
            <>
              <form onSubmit={handleForgotOtpSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-otp">Verification code</Label>
                  <Input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="0000"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-12 text-center text-lg tracking-[0.5em]"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={isLoading || otp.length < 4}
                >
                  {isLoading ? (
                    <>
                      <ProgressLoader size="sm" />
                      Verifying...
                    </>
                  ) : (
                    "Verify code"
                  )}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleForgotResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </p>
              <button
                type="button"
                onClick={resetToEmail}
                className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to sign in
              </button>
            </>
          )}

          {step === "forgot-reset" && (
            <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-password">New password</Label>
                <div className="relative">
                  <Input
                    id="reset-password"
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
                <Label htmlFor="reset-password-confirm">Confirm password</Label>
                <Input
                  id="reset-password-confirm"
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
                disabled={isLoading || password.length < 6 || password !== passwordConfirmation}
              >
                {isLoading ? (
                  <>
                    <ProgressLoader size="sm" />
                    Updating...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
              <button
                type="button"
                onClick={resetToEmail}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginPageContent />
    </React.Suspense>
  )
}
