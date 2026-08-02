import { FileStack } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function BlogsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Blogs</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Your Blogs</h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <FileStack className="size-12" />
          <p className="mt-4">Blog posts will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
