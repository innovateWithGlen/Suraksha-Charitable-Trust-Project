"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
}

const OUT_OF_SCOPE_REPLY =
  "I am Suraksha Sahayaka, the AI assistant for Suraksha Charitable Trust. I do not have that information in my current context. Please contact the trust office directly in Sirsi for accurate help."

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const nextMessages = [
      ...messages,
      { id: crypto.randomUUID(), role: "user" as const, text: trimmed },
    ]
    setMessages(nextMessages)
    setInput("")
    setIsTyping(true)

    try {
      const apiMessages = nextMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.text,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()
      const reply = data?.text || OUT_OF_SCOPE_REPLY

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: OUT_OF_SCOPE_REPLY,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className={cn(
            "flex w-[360px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl shadow-2xl",
            "border border-border/80",
            "bg-background/98 backdrop-blur-md",
            "animate-in fade-in slide-in-from-bottom-4 duration-300"
          )}
          style={{ height: "480px" }}
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Image
                  src="/images/logo.png"
                  alt="Suraksha Charitable Trust logo"
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Suraksha Sahayaka</p>
                <p className="text-[10px] text-primary-foreground/80">{isTyping ? "Typing..." : "Online"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !isTyping && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/20">
                  <Image
                    src="/images/logo.png"
                    alt="Suraksha Charitable Trust logo"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium text-foreground">Welcome to Suraksha Charitable Trust!</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">Ask me about 80G, 12A, PAN, location, and current initiatives.</p>
                <div className="mt-4 flex flex-col gap-2 w-full">
                  {[
                    "Is my donation tax exempt under 80G?",
                    "Where are you located in Sirsi?",
                    "What kind of work do you do?",
                    "What is your PAN and 12A URN?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {messages.map((message) => {
                const isUser = message.role === "user"
                return (
                  <div key={message.id} className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5",
                        isUser ? "bg-accent text-accent-foreground" : "bg-secondary/20 text-secondary"
                      )}
                    >
                      {isUser ? (
                        <User className="size-3" />
                      ) : (
                        <Image
                          src="/images/logo.png"
                          alt="Suraksha Charitable Trust logo"
                          width={16}
                          height={16}
                          className="rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                        isUser
                          ? "bg-accent text-accent-foreground rounded-tr-sm"
                          : "bg-muted/90 text-foreground rounded-tl-sm border border-border/60"
                      )}
                    >
                      {message.text}
                    </div>
                  </div>
                )
              })}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary mt-0.5">
                    <Image
                      src="/images/logo.png"
                      alt="Suraksha Charitable Trust logo"
                      width={16}
                      height={16}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-border/60 bg-muted/90 px-3 py-2">
                    <div className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-b-2xl border-t border-border bg-background/95 px-3 py-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isTyping}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="size-8 shrink-0 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex size-16 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-[#1f78e5] border-[3px] border-[#63acff]",
          "hover:scale-105"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="size-6 text-white" />
        ) : (
          <>
            <svg
              viewBox="0 0 64 64"
              className="pointer-events-none absolute inset-0 size-full"
              aria-hidden="true"
            >
              <defs>
                <path id="chatbot-label-top-arc" d="M 10 30 A 22 22 0 0 1 54 30" />
              </defs>
              <text fill="#ffffff" className="text-[4.8px] font-black uppercase tracking-[0.12em]">
                <textPath href="#chatbot-label-top-arc" startOffset="50%" textAnchor="middle">
                  SURAKSHA SAHAYAKA
                </textPath>
              </text>
            </svg>
            <span className="flex size-9 items-center justify-center rounded-full bg-white p-1.5 shadow-inner ring-2 ring-[#cfe5ff]">
              <Image
                src="/images/logo.png"
                alt="Open Suraksha Sahayaka"
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
            </span>
          </>
        )}
      </button>
    </div>
  )
}
