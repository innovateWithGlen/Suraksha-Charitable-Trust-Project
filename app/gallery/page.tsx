"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowRight, X, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ApiGalleryEvent = {
  _id: string
  title: string
  category: string
  customCategory?: string
  date: string
  location: string
  description?: string
  images: Array<{ url: string; caption?: string }>
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function MasonryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mb-2 break-inside-avoid sm:mb-3">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full rounded-md sm:rounded-lg"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

const categoryLabels: Record<string, string> = {
  education: "Education",
  healthcare: "Healthcare",
  environment: "Environment",
  community: "Community",
  events: "Events",
  "co-curricular": "Co-curricular",
  extracurricular: "Extracurricular",
  other: "Other",
}

const categoryColors: Record<string, string> = {
  education: "bg-blue-100 text-blue-800",
  healthcare: "bg-rose-100 text-rose-800",
  environment: "bg-emerald-100 text-emerald-800",
  community: "bg-amber-100 text-amber-800",
  events: "bg-indigo-100 text-indigo-800",
  "co-curricular": "bg-violet-100 text-violet-800",
  extracurricular: "bg-cyan-100 text-cyan-800",
  other: "bg-slate-100 text-slate-700",
}

function getCategoryLabel(event: Pick<ApiGalleryEvent, "category" | "customCategory">): string {
  if (event.category === "other" && event.customCategory?.trim()) {
    return event.customCategory.trim()
  }
  return categoryLabels[event.category] || event.category
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [lightbox, setLightbox] = useState<{ eventId: string } | null>(null)

  const query = `/api/gallery?active=true${activeCategory !== "all" ? `&category=${activeCategory}` : ""}`
  const { data, isLoading } = useSWR(query, fetcher, { refreshInterval: 5000 })

  const events: ApiGalleryEvent[] = data?.events || []

  const categories = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.category)))
    return ["all", ...unique]
  }, [events])

  const openLightbox = (eventId: string) => {
    setLightbox({ eventId })
  }

  const closeLightbox = () => setLightbox(null)

  const currentEvent = lightbox ? events.find((e) => e._id === lightbox.eventId) : null

  return (
    <>
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            srcSet="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=640&q=75 640w, https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=75 1200w, https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=75 1920w"
            sizes="100vw"
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">/ Our Programs /</span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
            Gallery & Events
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 leading-relaxed">
            Explore recent trust events and outreach work.
          </p>
        </div>
      </section>

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
                {cat === "all" ? "All" : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading gallery...</div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No gallery events available.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {events.map((event) => {
                const images = event.images.map((item) => item.url)
                const coverImage = images[0]

                return (
                  <div
                    key={event._id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                  >
                    <button
                      onClick={() => openLightbox(event._id)}
                      className="relative aspect-[5/3] w-full overflow-hidden"
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={event.title}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                          No image
                        </div>
                      )}
                      {images.length > 1 && (
                        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                          +{images.length - 1} photos
                        </span>
                      )}
                    </button>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <Badge
                        variant="secondary"
                        className={`w-fit text-xs ${categoryColors[event.category] || ""}`}
                      >
                        {getCategoryLabel(event)}
                      </Badge>
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      {event.description ? (
                        <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      ) : null}
                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0" />
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-pretty text-3xl font-bold text-accent-foreground sm:text-4xl">
            Want to Participate?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80 leading-relaxed">
            Join our upcoming events or support our programs with a donation.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link href="/donate" className="flex items-center gap-2">
                Donate Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 font-semibold">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {lightbox && currentEvent && currentEvent.images.length > 0 ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/90 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer for ${currentEvent.title}`}
        >
          <button
            onClick={closeLightbox}
            className="fixed right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>

          <div className="flex min-h-full p-4">
            <div
              className="m-auto flex w-full max-w-5xl flex-col items-center gap-3 sm:gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{currentEvent.title}</p>
                {currentEvent.description ? (
                  <p className="mx-auto mt-1 max-w-2xl whitespace-pre-line text-sm text-white/70">
                    {currentEvent.description}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-white/60">
                  {currentEvent.images.length} photo{currentEvent.images.length > 1 ? "s" : ""}
                </p>
              </div>
              <div className="w-full columns-2 [column-gap:8px] sm:columns-3 sm:[column-gap:12px] md:columns-4">
                {currentEvent.images.map((image, i) => (
                  <MasonryImage
                    key={image.url || i}
                    src={image.url}
                    alt={`${currentEvent.title} photo ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
