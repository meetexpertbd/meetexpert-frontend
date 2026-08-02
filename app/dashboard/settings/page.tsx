import { Settings } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account Settings</h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Settings className="size-12" />
          <p className="mt-4">Settings options will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
