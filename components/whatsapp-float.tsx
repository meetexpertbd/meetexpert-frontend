import Link from "next/link"
import { MessageCircle } from "lucide-react"

export function WhatsappFloat() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801700000000"
  const number = rawNumber.replace(/\D/g, "")
  const href = `https://wa.me/${number}`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg outline-none ring-offset-2 transition-transform hover:scale-[1.04] hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background dark:bg-emerald-500 dark:hover:bg-emerald-600"
    >
      <MessageCircle className="size-6" aria-hidden />
      <span className="sr-only">WhatsApp</span>
    </Link>
  )
}