"use client"

import { useState } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const events = [
  {
    id: "1",
    title: "Annual Education Drive 2025",
    category: "Education",
    date: "March 15, 2025",
    location: "Andheri, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&q=80",
    ],
    coverIndex: 0,
  },
  {
    id: "2",
    title: "Free Health Camp - Thane",
    category: "Healthcare",
    date: "April 10, 2025",
    location: "Thane, Maharashtra",
    images: [
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=600&q=80",
    ],
    coverIndex: 0,
  },
  {
    id: "3",
    title: "Tree Plantation Drive",
    category: "Environment",
    date: "June 5, 2025",
    location: "Sanjay Gandhi National Park",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
      "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80",
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=600&q=80",
    ],
    coverIndex: 0,
  },
  {
    id: "4",
    title: "Women Skill Development Workshop",
    category: "Women Empowerment",
    date: "July 20, 2025",
    location: "Pune, Maharashtra",
    images: [
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&q=80",
    ],
    coverIndex: 0,
  },
  {
    id: "5",
    title: "Child Nutrition Program",
    category: "Child Welfare",
    date: "August 12, 2025",
    location: "Dharavi, Mumbai",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80",
      "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=600&q=80",
    ],
    coverIndex: 0,
  },
  {
    id: "6",
    title: "Community Clean Water Initiative",
    category: "Environment",
    date: "September 22, 2025",
    location: "Raigad, Maharashtra",
    images: [
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80",
      "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=600&q=80",
    ],
    coverIndex: 0,
  },
]

const categories = ["All", "Education", "Healthcare", "Environment", "Women Empowerment", "Child Welfare"]

const categoryColors: Record<string, string> = {
  Education: "bg-blue-100 text-blue-800",
  Healthcare: "bg-rose-100 text-rose-800",
  Environment: "bg-emerald-100 text-emerald-800",
  "Women Empowerment": "bg-amber-100 text-amber-800",
  "Child Welfare": "bg-indigo-100 text-indigo-800",
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [lightbox, setLightbox] = useState<{ eventId: string; imageIndex: number } | null>(null)

  const filtered =
    activeCategory === "All"
      ? events
      : events.filter((e) => e.category === activeCategory)

  const openLightbox = (eventId: string, imageIndex: number) => {
    setLightbox({ eventId, imageIndex })
  }

  const closeLightbox = () => setLightbox(null)

  const currentEvent = lightbox ? events.find((e) => e.id === lightbox.eventId) : null

  const navigateLightbox = (dir: "prev" | "next") => {
    if (!lightbox || !currentEvent) return
    const total = currentEvent.images.length
    const newIndex =
      dir === "next"
        ? (lightbox.imageIndex + 1) % total
        : (lightbox.imageIndex - 1 + total) % total
    setLightbox({ ...lightbox, imageIndex: newIndex })
  }

  return (
    <>
      {/* Hero banner */}
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
            crossOrigin="anonymous"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">/ Our Programs /</span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
            Gallery & Events
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 leading-relaxed">
            Explore our recent events, drives, and community outreach programs through photos and stories.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <p className="text-lg text-muted-foreground">No events found in this category.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Cover image */}
                  <button
                    onClick={() => openLightbox(event.id, event.coverIndex)}
                    className="relative aspect-[4/3] w-full overflow-hidden"
                  >
                    <img
                      src={event.images[event.coverIndex]}
                      alt={event.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      crossOrigin="anonymous"
                    />
                    {event.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                        +{event.images.length - 1} photos
                      </span>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <Badge
                      variant="secondary"
                      className={`w-fit text-xs ${categoryColors[event.category] || ""}`}
                    >
                      {event.category}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground">
                      {event.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        {event.location}
                      </span>
                    </div>

                    {/* Thumbnail strip */}
                    {event.images.length > 1 && (
                      <div className="mt-auto flex gap-2 pt-3">
                        {event.images.slice(0, 4).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => openLightbox(event.id, idx)}
                            className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border transition-opacity hover:opacity-80"
                          >
                            <img
                              src={img}
                              alt={`${event.title} photo ${idx + 1}`}
                              className="size-full object-cover"
                              crossOrigin="anonymous"
                            />
                            {idx === 3 && event.images.length > 4 && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                                +{event.images.length - 4}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-pretty text-3xl font-bold text-accent-foreground sm:text-4xl">
            Want to Participate?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80 leading-relaxed">
            Join our upcoming events or support our programs with a donation.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              <Link href="/donate" className="flex items-center gap-2">
                Donate Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 font-semibold"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && currentEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer for ${currentEvent.title}`}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>

          {currentEvent.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox("prev")
                }}
                className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox("next")
                }}
                className="absolute right-14 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4 sm:left-auto"
                style={{ right: undefined }}
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div
            className="flex max-h-[85vh] max-w-5xl flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentEvent.images[lightbox.imageIndex]}
              alt={`${currentEvent.title} photo ${lightbox.imageIndex + 1}`}
              className="max-h-[75vh] w-auto rounded-lg object-contain"
              crossOrigin="anonymous"
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{currentEvent.title}</p>
              <p className="text-sm text-white/60">
                {lightbox.imageIndex + 1} of {currentEvent.images.length}
              </p>
            </div>
          </div>

          {currentEvent.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox("next")
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="size-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateLightbox("prev")
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
