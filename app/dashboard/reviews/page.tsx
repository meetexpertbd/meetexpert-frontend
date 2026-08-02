import { Star } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ReviewsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Reviews</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Client Reviews</h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Star className="size-12" />
          <p className="mt-4">Reviews will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
