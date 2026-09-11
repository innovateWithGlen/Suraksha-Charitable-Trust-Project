"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Quote, ChevronLeft, ChevronRight } from "lucide-react"

const testimonials = [
  {
    quote:
      "Suraksha Trust gave my daughter the opportunity to attend school. We are forever grateful for their support and kindness.",
    name: "Manish Honnavar",
    role: "Parent — Education Program",
  },
  {
    quote:
      "Volunteering with Suraksha has been one of the most rewarding experiences of my life. The impact they make is truly remarkable.",
    name: "Aarya Shetty",
    role: "Volunteer",
  },
  {
    quote:
      "Their healthcare camps in our village have made a real difference. Many families now have access to basic medical care.",
    name: "Elveena Nazareth",
    role: "Community Health Worker",
  },
  {
    quote:
      "The free medical camp organized by Suraksha Trust detected my mother's blood pressure issue early. We owe her health to their dedication.",
    name: "Rajesh Kowdekar",
    role: "Beneficiary — Healthcare Camp",
  },
  {
    quote:
      "My son received school supplies and uniforms through the education drive. He now attends classes regularly with confidence.",
    name: "Sunita Naik",
    role: "Parent — Education Drive",
  },
  {
    quote:
      "The tree plantation drive in our area was well-organized. Suraksha Trust brought together over 200 volunteers for a greener future.",
    name: "Pradeep Shetkar",
    role: "Volunteer — Environment Drive",
  },
  {
    quote:
      "I attended the women empowerment workshop and learned tailoring skills. Today I run a small business and support my family independently.",
    name: "Lakshmi Bhat",
    role: "Beneficiary — Women Empowerment",
  },
  {
    quote:
      "The cultural program organized by Suraksha gave our children a platform to showcase their talents. It was a proud moment for all parents.",
    name: "Vinay Hegde",
    role: "Parent — Cultural Event",
  },
  {
    quote:
      "Suraksha's co-curricular activities helped my daughter discover her passion for painting. She now participates in district-level competitions.",
    name: "Meena Khot",
    role: "Parent — Co-curricular Program",
  },
  {
    quote:
      "The blood donation camp organized by the trust saved multiple lives. I was proud to donate and be part of this noble cause.",
    name: "Ashok Talwar",
    role: "Donor — Blood Donation Camp",
  },
  {
    quote:
      "My village received clean drinking water thanks to Suraksha Trust. Their community development work is transforming rural Karnataka.",
    name: "Parvati Haldipur",
    role: "Villager — Community Development",
  },
  {
    quote:
      "The extracurricular sports program gave our rural children a chance to compete at the state level. Suraksha believes in every child's potential.",
    name: "Sanjay Borkar",
    role: "Coach — Sports Program",
  },
  {
    quote:
      "As a corporate partner, we have seen firsthand how Suraksha utilizes CSR funds with transparency and accountability. A truly trustworthy organization.",
    name: "Neha Kapoor",
    role: "CSR Partner — Corporate Volunteer",
  },
]

const CARD_WIDTH = 324
const TOTAL = testimonials.length
const SCROLL_WIDTH = TOTAL * CARD_WIDTH

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const pausedAtRef = useRef<number | null>(null)

  const duplicated = [...testimonials, ...testimonials]

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      left: index * CARD_WIDTH,
      behavior: smooth ? "smooth" : "instant",
    })
  }, [])

  const handlePrev = () => {
    if (!scrollRef.current) return
    const current = Math.round(scrollRef.current.scrollLeft / CARD_WIDTH)
    if (current <= 0) {
      scrollToIndex(TOTAL, false)
      requestAnimationFrame(() => scrollToIndex(TOTAL - 1))
    } else {
      scrollToIndex(current - 1)
    }
  }

  const handleNext = () => {
    if (!scrollRef.current) return
    const current = Math.round(scrollRef.current.scrollLeft / CARD_WIDTH)
    if (current >= TOTAL - 1) {
      scrollToIndex(TOTAL, false)
      requestAnimationFrame(() => scrollToIndex(TOTAL + 1))
    } else {
      scrollToIndex(current + 1)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const speed = 0.03

    const tick = (timestamp: number) => {
      if (isPaused) {
        lastTimeRef.current = null
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      const scrolled = el.scrollLeft + speed * delta

      if (scrolled >= SCROLL_WIDTH) {
        el.scrollTo({ left: scrolled - SCROLL_WIDTH, behavior: "instant" })
      } else {
        el.scrollTo({ left: scrolled, behavior: "instant" })
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPaused])

  return (
    <section className="bg-background py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-secondary">/ Testimonials /</span>
          <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
            What People Say
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Hear from the communities, volunteers, and partners whose lives have been touched by our work.
          </p>
        </div>

        <div className="relative mt-12">
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full border-border bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="size-5" />
          </Button>

          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 1000)}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {duplicated.map((testimonial, i) => (
              <Card
                key={i}
                className="min-w-[300px] max-w-[340px] shrink-0 bg-card border-border"
              >
                <CardContent className="flex flex-col gap-4 pt-6">
                  <Quote className="size-8 text-accent" />
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    {`"${testimonial.quote}"`}
                  </p>
                  <div className="mt-auto pt-4 border-t border-border">
                    <p className="text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
