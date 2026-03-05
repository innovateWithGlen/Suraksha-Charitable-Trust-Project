"use client"

import { MessageCircle } from "lucide-react"

function getWhatsAppUrl(message: string) {
  const number = process.env.NEXT_PUBLIC_TRUST_WHATSAPP_NUMBER || process.env.TRUST_WHATSAPP_NUMBER || "919876543210"
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function WhatsAppConnect({
  message = "Hi Suraksha Team, I would like to know more.",
  floating = false,
  className = "",
}: {
  message?: string
  floating?: boolean
  className?: string
}) {
  const href = getWhatsAppUrl(message)

  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className={`fixed bottom-6 left-6 z-50 flex size-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:scale-105 ${className}`}
      >
        <MessageCircle className="size-6" />
      </a>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 ${className}`}
    >
      <MessageCircle className="size-4" />
      WhatsApp Us
    </a>
  )
}
