"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const [chatbotEnabled, setChatbotEnabled] = useState(true)

  useEffect(() => {
    if (isAdmin) return

    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data) => {
        const value = data.settings?.chatbotEnabled
        if (value !== undefined) {
          setChatbotEnabled(value.toLowerCase() === "true")
        }
      })
      .catch(() => {})
  }, [isAdmin])

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      {chatbotEnabled && <Chatbot />}
    </>
  )
}
