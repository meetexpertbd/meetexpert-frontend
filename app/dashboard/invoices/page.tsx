import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function InvoicesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Invoices</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All Invoices</h2>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <FileText className="size-12" />
          <p className="mt-4">Invoice history will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
