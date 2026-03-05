"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"
import { WhatsAppConnect } from "@/components/whatsapp-connect"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppConnect floating message="Hi Suraksha Team, I need help with donations or 80G certificate." />
      <Chatbot />
    </>
  )
}
