"use client"

import * as React from "react"
import Image from "next/image"
import {
  Search,
  Users,
  Wallet,
  Gift,
  Video,
  Phone,
  Calendar,
  X,
  Check,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const stats = [
  { label: "Total Mentees", value: "200", icon: Users, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
  { label: "Total Earnings", value: "$4200", icon: Wallet, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  { label: "Pending Requests", value: "15", icon: Gift, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30" },
]

const sessionRequests = [
  {
    id: "1",
    name: "Robert Pino",
    email: "robert@example.com",
    date: "18 Dec 2026, 09:00 AM",
    type: "video" as const,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
  {
    id: "2",
    name: "Sara Griswold",
    email: "sara@example.com",
    date: "19 Dec 2026, 02:30 PM",
    type: "audio" as const,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop",
  },
]

const earningsData = [40, 65, 50, 75, 55, 80, 70, 90, 85, 95, 88, 100]

const invoices = [
  {
    id: "#INV0016",
    name: "Robert Pino",
    email: "robert@example.com",
    date: "18 Dec 2026",
    amount: "$300",
    method: "PayPal",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
  },
]

export default function DashboardPage() {
  const [earningsPeriod, setEarningsPeriod] = React.useState("This Year")

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="h-10 pl-9"
          />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="flex items-start justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn("flex size-12 items-center justify-center rounded-xl", stat.color)}>
                  <Icon className="size-6" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Session Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full">
                  <Image src={req.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{req.name}</p>
                  <p className="text-xs text-muted-foreground">{req.email}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {req.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      req.type === "video" && "bg-violet-600 hover:bg-violet-700",
                      req.type === "audio" && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    {req.type === "video" ? <Video className="size-4" /> : <Phone className="size-4" />}
                    {req.type === "video" ? "Video Call" : "Audio Call"}
                  </Button>
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Decline"
                  >
                    <X className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Accept"
                  >
                    <Check className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-lg font-semibold">Earnings</h3>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setEarningsPeriod(earningsPeriod === "This Year" ? "This Month" : "This Year")}
            >
              {earningsPeriod}
              <span className="text-xs">▼</span>
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end justify-between gap-1">
              {earningsData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary transition-all hover:opacity-90"
                  style={{ height: `${h}%`, minHeight: "8px" }}
                  title={`${h}%`}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold">Recent Invoices</h3>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Invoice ID</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Payment Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Payment Method</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{inv.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative size-8 overflow-hidden rounded-full">
                        <Image src={inv.image} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">{inv.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{inv.date}</td>
                  <td className="py-3 font-medium">{inv.amount}</td>
                  <td className="py-3 text-muted-foreground">{inv.method}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="View"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
