"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressLoaderScreen } from "@/components/ui/progress-loader"
import { ApiError } from "@/lib/api-client"
import {
  fetchBookingMeeting,
  normalizeBookingMeeting,
  normalizeMeetingCredentials,
  type MeetingJoins,
} from "@/lib/expert-api"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type AgoraClient = {
  join: (
    appId: string,
    channel: string,
    token: string | null,
    uid: number | null
  ) => Promise<unknown>
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

type AgoraScreenTrack = {
  play: (el?: HTMLElement) => void
  stop: () => void
  close: () => void
  on: (event: string, handler: () => void) => void
}

function formatJoinedAt(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function JoinStatusPill({
  label,
  party,
}: {
  label: string
  party: { status: string; joined_at: string | null } | null | undefined
}) {
  const joined = party?.status === "joined"
  const time = formatJoinedAt(party?.joined_at ?? null)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs",
        joined
          ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          joined ? "bg-emerald-600" : "bg-muted-foreground/50"
        )}
      />
      {label}
      {joined ? (time ? ` · ${time}` : " · Joined") : " · Waiting"}
    </span>
  )
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
  const [sharing, setSharing] = React.useState(false)
  const [remoteSharing, setRemoteSharing] = React.useState(false)
  const [meetingJoins, setMeetingJoins] = React.useState<MeetingJoins | null>(null)

  const localRef = React.useRef<HTMLDivElement>(null)
  const remoteRef = React.useRef<HTMLDivElement>(null)
  const screenLocalRef = React.useRef<HTMLDivElement>(null)
  const screenRemoteRef = React.useRef<HTMLDivElement>(null)
  const clientRef = React.useRef<AgoraClient | null>(null)
  const audioTrackRef = React.useRef<AgoraMediaTrack | null>(null)
  const videoTrackRef = React.useRef<AgoraMediaTrack | null>(null)
  const screenTrackRef = React.useRef<AgoraScreenTrack | null>(null)
  const screenClientRef = React.useRef<AgoraClient | null>(null)

  React.useEffect(() => { setMounted(true) }, [])

  const stopScreenShare = React.useCallback(async () => {
    try {
      screenTrackRef.current?.stop()
      screenTrackRef.current?.close()
      screenTrackRef.current = null
      if (screenClientRef.current) {
        screenClientRef.current.removeAllListeners()
        await screenClientRef.current.leave()
        screenClientRef.current = null
      }
    } catch { /* ignore */ }
    setSharing(false)
  }, [])

  const cleanup = React.useCallback(async () => {
    await stopScreenShare()
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
  }, [stopScreenShare])

  React.useEffect(() => () => { void cleanup() }, [cleanup])

  // Play local video once the room UI is rendered (localRef is available)
  React.useEffect(() => {
    if (status !== "ready") return
    const track = videoTrackRef.current
    if (track && localRef.current) {
      track.play(localRef.current)
    }
  }, [status])

  // Refresh join status while in the room
  React.useEffect(() => {
    if (status !== "ready" || !token || !bookingId) return

    let cancelled = false

    async function refreshJoins() {
      try {
        const res = await fetchBookingMeeting(token!, bookingId)
        const joins = normalizeBookingMeeting(res.data ?? res).meeting_joins
        if (!cancelled && joins) setMeetingJoins(joins)
      } catch {
        // ignore poll errors
      }
    }

    const id = window.setInterval(() => {
      void refreshJoins()
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [status, token, bookingId])

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

    let cancelled = false

    async function start() {
      setStatus("loading")
      setError(null)

      try {
        const AgoraRTC = (await import("agora-rtc-sdk-ng")).default

        const res = await fetchBookingMeeting(token!, bookingId)
        const payload = normalizeBookingMeeting(res.data ?? res)
        const credentials = payload.credentials
        if (!credentials) {
          throw new Error("Meeting credentials are incomplete.")
        }
        if (!cancelled && payload.meeting_joins) {
          setMeetingJoins(payload.meeting_joins)
        }

        if (cancelled) return

        await cleanup()

        const client = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        }) as unknown as AgoraClient
        clientRef.current = client

        client.on("user-published", async (remoteUser, mediaType) => {
          const rUser = remoteUser as AgoraRemoteUser
          const type = mediaType as string
          await client.subscribe(rUser, type)
          if (type === "video") {
            setRemoteUid(rUser.uid)
            if (remoteRef.current) {
              rUser.videoTrack?.play(remoteRef.current)
            }
          }
          if (type === "audio") {
            rUser.audioTrack?.play()
          }
        })

        client.on("user-unpublished", (remoteUser, mediaType) => {
          const rUser = remoteUser as AgoraRemoteUser
          if ((mediaType as string) === "video") {
            setRemoteUid((cur) => (cur === rUser.uid ? null : cur))
          }
        })

        client.on("user-left", (remoteUser) => {
          const rUser = remoteUser as AgoraRemoteUser
          setRemoteUid((cur) => (cur === rUser.uid ? null : cur))
          setRemoteSharing(false)
        })

        // Screen share: detect remote screen track by uid convention (uid + 10000)
        client.on("user-published", async (remoteUser, mediaType) => {
          const rUser = remoteUser as AgoraRemoteUser
          const type = mediaType as string
          const isScreen =
            typeof rUser.uid === "number" && rUser.uid > 10000
          if (!isScreen) return
          await client.subscribe(rUser, type)
          if (type === "video") {
            setRemoteSharing(true)
            if (screenRemoteRef.current) {
              rUser.videoTrack?.play(screenRemoteRef.current)
            }
          }
        })

        client.on("user-unpublished", (_remoteUser, mediaType) => {
          const type = mediaType as string
          const rUser = _remoteUser as AgoraRemoteUser
          const isScreen =
            typeof rUser.uid === "number" && rUser.uid > 10000
          if (isScreen && type === "video") setRemoteSharing(false)
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

        if (cancelled) return

        // Get local tracks — allow camera to fail gracefully so mic still works
        let audioTrack: AgoraMediaTrack | null = null
        let videoTrack: AgoraMediaTrack | null = null

        try {
          const tracks = (await AgoraRTC.createMicrophoneAndCameraTracks()) as [
            AgoraMediaTrack,
            AgoraMediaTrack,
          ]
          audioTrack = tracks[0]
          videoTrack = tracks[1]
        } catch {
          try {
            audioTrack = (await AgoraRTC.createMicrophoneAudioTrack()) as AgoraMediaTrack
          } catch {
            // no mic either — continue without local tracks
          }
        }

        if (audioTrack) audioTrackRef.current = audioTrack
        if (videoTrack) videoTrackRef.current = videoTrack

        const toPublish = [audioTrack, videoTrack].filter(Boolean)
        if (toPublish.length > 0) {
          await client.publish(toPublish)
        }

        if (!cancelled) {
          setJoined(true)
          setStatus("ready")
          // localRef won't exist yet — played in the status effect above
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

    return () => { cancelled = true }
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
    if (next && localRef.current) {
      track.play(localRef.current)
    }
    setCamOn(next)
  }

  async function leaveMeeting() {
    await cleanup()
    router.push("/dashboard/bookings")
  }

  async function toggleScreen() {
    if (sharing) {
      await stopScreenShare()
      return
    }
    try {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default
      const credentials = normalizeMeetingCredentials(
        await fetchBookingMeeting(token!, bookingId).then((r) => r.data ?? r)
      )
      if (!credentials) return

      const screenClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      }) as unknown as AgoraClient
      screenClientRef.current = screenClient

      // Use a high uid to distinguish screen-share from camera
      const screenUid =
        (typeof credentials.uid === "number"
          ? credentials.uid
          : Number(credentials.uid) || 0) + 10000

      await screenClient.join(
        credentials.app_id,
        credentials.channel,
        credentials.token || null,
        screenUid
      )

      const screenTrack = (await AgoraRTC.createScreenVideoTrack(
        { encoderConfig: "1080p_1" },
        "disable"
      )) as unknown as AgoraScreenTrack

      screenTrackRef.current = screenTrack

      // Stop sharing when user ends it via browser UI
      screenTrack.on("track-ended", () => { void stopScreenShare() })

      await screenClient.publish([screenTrack as unknown])

      if (screenLocalRef.current) {
        screenTrack.play(screenLocalRef.current)
      }

      setSharing(true)
    } catch (e) {
      await stopScreenShare()
      if (e instanceof Error && e.message.includes("Permission denied")) return
    }
  }

  const isExpert = user?.user_type === "expert"
  const otherPartyJoined =
    meetingJoins == null
      ? null
      : isExpert
        ? meetingJoins.user.status === "joined"
        : meetingJoins.expert.status === "joined"
  const waitingLabel =
    otherPartyJoined === false
      ? isExpert
        ? "Waiting for the user…"
        : "Waiting for the expert…"
      : "Waiting for the other participant…"

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
          {meetingJoins ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <JoinStatusPill label="User" party={meetingJoins.user} />
              <JoinStatusPill label="Expert" party={meetingJoins.expert} />
            </div>
          ) : null}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bookings">Bookings</Link>
        </Button>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-6">
        {/* Screen share row (visible when either side is sharing) */}
        {(sharing || remoteSharing) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {remoteSharing && (
              <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:min-h-[300px]">
                <div ref={screenRemoteRef} className="absolute inset-0 size-full" />
                <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
                  Remote screen
                </span>
              </div>
            )}
            {sharing && (
              <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-primary/50 bg-muted/40 sm:min-h-[300px]">
                <div ref={screenLocalRef} className="absolute inset-0 size-full" />
                <span className="absolute top-3 left-3 rounded-full bg-primary/80 px-2.5 py-1 text-xs text-white">
                  Your screen
                </span>
              </div>
            )}
          </div>
        )}

        {/* Camera row */}
        <div className="grid flex-1 gap-4 sm:grid-cols-[1.4fr_1fr]">
          {/* Remote camera */}
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:min-h-[320px]">
            <div ref={remoteRef} className="absolute inset-0 size-full" />
            {!remoteUid && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Video className="size-8" />
                <p className="text-sm">{waitingLabel}</p>
              </div>
            )}
            <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
              Remote
            </span>
          </div>

          {/* Local camera */}
          <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-border bg-muted/40 sm:min-h-[320px]">
            <div
              ref={localRef}
              className={cn("absolute inset-0 size-full", !camOn && "opacity-0")}
            />
            {!videoTrackRef.current || !camOn ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <VideoOff className="size-8" />
              </div>
            ) : null}
            <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white">
              You {joined ? "· Live" : ""}
            </span>
          </div>
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
            disabled={!audioTrackRef.current}
          >
            {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </Button>
          <Button
            type="button"
            variant={camOn ? "outline" : "destructive"}
            size="icon-lg"
            onClick={() => void toggleCam()}
            aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            disabled={!videoTrackRef.current}
          >
            {camOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
          </Button>
          <Button
            type="button"
            variant={sharing ? "default" : "outline"}
            size="icon-lg"
            onClick={() => void toggleScreen()}
            aria-label={sharing ? "Stop sharing screen" : "Share screen"}
            title={sharing ? "Stop sharing" : "Share screen"}
          >
            {sharing ? <MonitorOff className="size-5" /> : <Monitor className="size-5" />}
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
