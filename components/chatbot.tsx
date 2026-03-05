"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
}

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
      const reply = data?.text || "I don't have information about that in our documents. Please contact us directly."

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
          text: "I don't have information about that in our documents. Please contact us directly.",
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
            "border border-white/20",
            "bg-card/80 backdrop-blur-xl",
            "animate-in fade-in slide-in-from-bottom-4 duration-300"
          )}
          style={{ height: "480px" }}
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-primary/90 backdrop-blur-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="size-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Suraksha Assistant</p>
                <p className="text-[10px] text-primary-foreground/60">{isTyping ? "Typing..." : "Online"}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-primary-foreground/60 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && !isTyping && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10 mb-3">
                  <Bot className="size-6 text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">Welcome to Suraksha Trust!</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">I answer only from trust documents.</p>
                <div className="mt-4 flex flex-col gap-2 w-full">
                  {[
                    "How can I donate?",
                    "Do you provide 80G certificate?",
                    "What programs does the trust run?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-lg border border-border bg-card/50 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors text-left"
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
                      {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                        isUser ? "bg-accent text-accent-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
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
                    <Bot className="size-3" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2">
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

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border/50 bg-card/50 backdrop-blur-sm px-3 py-3 rounded-b-2xl">
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
          "group flex size-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-secondary/90 backdrop-blur-md border border-white/20",
          "hover:bg-secondary hover:scale-105"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="size-6 text-secondary-foreground" /> : <MessageCircle className="size-6 text-secondary-foreground" />}
      </button>
    </div>
  )
}
