import { Geist_Mono, Noto_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { WhatsappFloat } from "@/components/whatsapp-float"
import { cn } from "@/lib/utils"

const notoSans = Noto_Sans({ variable: "--font-sans" })
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", notoSans.variable)}
    >
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
              {children}
              <Footer />
            </div>
            <WhatsappFloat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}