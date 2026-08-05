"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import {
  fetchBookingMeeting,
  normalizeMeetingCredentials,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type AgoraClient = {
  join: (
    appId: string,
    channel: string,
    token: string | null,
    uid: number | null
  ) => Promise<void>
  leave: () => Promise<void>
  publish: (tracks: unknown[]) => Promise<void>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeAllListeners: () => void
  subscribe: (user: unknown, mediaType: string) => Promise<void>
}

type AgoraRemoteUser = {
  uid: string | number
  videoTrack?: { play: (el: HTMLElement) => void }
  audioTrack?: { play: () => void }
}

type AgoraMediaTrack = {
  play: (el?: HTMLElement) => void
  stop: () => void
  close: () => void
  setEnabled: (enabled: boolean) => Promise<void>
}

function canUseMediaDevices(): boolean {
  if (typeof window === "undefined") return false
  return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia)
}

function mediaUnavailableMessage(): string {
  if (typeof window === "undefined") {
    return "Camera and microphone are only available in the browser."
  }
  if (!window.isSecureContext) {
    return "Camera and microphone require HTTPS (or localhost). Open the site over a secure connection and try again."
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "This browser does not support camera or microphone access."
  }
  return "Camera and microphone are unavailable."
}

export default function MeetingPage() {
  const params = useParams<{ bookingId: string }>()
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const user = useAuthStore((s) => s.user)

  const bookingId = params.bookingId
  const [mounted, setMounted] = React.useState(false)

  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [joined, setJoined] = React.useState(false)
  const [micOn, setMicOn] = React.useState(true)
  const [camOn, setCamOn] = React.useState(true)
  const [remoteUid, setRemoteUid] = React.useState<string | number | null>(null)

  const localRef = React.useRef<HTMLDivElement>(null)
  const remoteRef = React.useRef<HTMLDivElement>(null)
  const clientRef = React.useRef<AgoraClient | null>(null)
  const audioTrackRef = React.useRef<AgoraMediaTrack | null>(null)
  const videoTrackRef = React.useRef<AgoraMediaTrack | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cleanup = React.useCallback(async () => {
    try {
      audioTrackRef.current?.stop()
      audioTrackRef.current?.close()
      videoTrackRef.current?.stop()
      videoTrackRef.current?.close()
      audioTrackRef.current = null
      videoTrackRef.current = null
      if (clientRef.current) {
        clientRef.current.removeAllListeners()
        await clientRef.current.leave()
        clientRef.current = null
      }
    } catch {
      // ignore leave errors
    }
    setJoined(false)
    setRemoteUid(null)
  }, [])

  React.useEffect(() => {
    return () => {
      void cleanup()
    }
  }, [cleanup])

  React.useEffect(() => {
    if (!mounted || !isHydrated) return
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(`/dashboard/meeting/${bookingId}`)}`)
      return
    }
    if (!bookingId) {
      setError("Invalid booking.")
      setStatus("error")
      return
    }
    if (!canUseMediaDevices()) {
      setError(mediaUnavailableMessage())
      setStatus("error")
      return
    }

    let cancelled = false

    async function start() {
      setStatus("loading")
      setError(null)

      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default

        const res = await fetchBookingMeeting(token!, bookingId)
        const credentials = normalizeMeetingCredentials(res.data ?? res)
        if (!credentials) {
          throw new Error("Meeting credentials are incomplete.")
        }

        await cleanup()

        const client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        }) as unknown as AgoraClient
        clientRef.current = client

        client.on("user-published", async (remoteUser, mediaType) => {
          const user = remoteUser as AgoraRemoteUser
          const type = mediaType as string
          await client.subscribe(user, type)
          if (type === "video") {
            setRemoteUid(user.uid)
            if (remoteRef.current) {
              user.videoTrack?.play(remoteRef.current)
            }
          }
          if (type === "audio") {
            user.audioTrack?.play()
          }
        })

        client.on("user-unpublished", (remoteUser, mediaType) => {
          const user = remoteUser as AgoraRemoteUser
          if ((mediaType as string) === "video") {
            setRemoteUid((current) => (current === user.uid ? null : current))
          }
        })

        client.on("user-left", (remoteUser) => {
          const user = remoteUser as AgoraRemoteUser
          setRemoteUid((current) => (current === user.uid ? null : current))
        })

        const uid =
          typeof credentials.uid === "number"
            ? credentials.uid
            : Number(credentials.uid) || null

        await client.join(
          credentials.app_id,
          credentials.channel,
          credentials.token || null,
          uid
        )

        const [audioTrack, videoTrack] =
          (await AgoraRTC.createMicrophoneAndCameraTracks()) as [
            AgoraMediaTrack,
            AgoraMediaTrack,
          ]
        audioTrackRef.current = audioTrack
        videoTrackRef.current = videoTrack

        if (localRef.current) {
          videoTrack.play(localRef.current)
        }

        await client.publish([audioTrack, videoTrack])

        if (!cancelled) {
          setJoined(true)
          setStatus("ready")
        }
      } catch (e) {
        if (cancelled) return
        await cleanup()
        let message = "Could not join the meeting."
        if (e instanceof ApiError) message = e.message
        else if (e instanceof Error) message = e.message
        setError(message)
        setStatus("error")
      }
    }

    void start()

    return () => {
      cancelled = true
    }
  }, [mounted, isHydrated, token, bookingId, router, cleanup])

  async function toggleMic() {
    const track = audioTrackRef.current
    if (!track) return
    const next = !micOn
    await track.setEnabled(next)
    setMicOn(next)
  }

  async function toggleCam() {
    const track = videoTrackRef.current
    if (!track) return
    const next = !camOn
    await track.setEnabled(next)
    setCamOn(next)
  }

  async function leaveMeeting() {
    await cleanup()
    router.push("/dashboard/bookings")
  }

  if (!mounted || !isHydrated || status === "loading") {
    return (
      <ProgressLoaderScreen
        className="min-h-[calc(100vh-3.5rem)]"
        label="Joining meeting…"
      />
    )
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
        <Video className="size-10 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Unable to join</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/bookings">
              <ArrowLeft className="size-4" />
              Back to bookings
            </Link>
          </Button>
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Video consultation</p>
          <h1 className="text-base font-semibold text-foreground">
            {user?.name ? `${user.name}'s meeting` : "Live meeting"}
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bookings">Bookings</Link>
        </Button>
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 gap-4 p-4 sm:grid-cols-[1.4fr_1fr] sm:p-6">
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:min-h-[420px]">
          <div ref={remoteRef} className="absolute inset-0 size-full" />
          {!remoteUid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Video className="size-8" />
              <p className="text-sm">Waiting for the other participant…</p>
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
            Remote
          </span>
        </div>

        <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:min-h-[420px]">
          <div
            ref={localRef}
            className={cn("absolute inset-0 size-full", !camOn && "opacity-0")}
          />
          {!camOn && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <VideoOff className="size-8" />
            </div>
          )}
          <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
            You {joined ? "· Live" : ""}
          </span>
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
          <Button
            type="button"
            variant={micOn ? "outline" : "destructive"}
            size="icon-lg"
            onClick={() => void toggleMic()}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          >
            {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </Button>
          <Button
            type="button"
            variant={camOn ? "outline" : "destructive"}
            size="icon-lg"
            onClick={() => void toggleCam()}
            aria-label={camOn ? "Turn camera off" : "Turn camera on"}
          >
            {camOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={() => void leaveMeeting()}
          >
            <PhoneOff className="size-4" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  )
}
