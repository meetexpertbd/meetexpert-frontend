import { Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function MenteesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Mentees</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Mentees</h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Users className="size-12" />
          <p className="mt-4">Mentee list will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
