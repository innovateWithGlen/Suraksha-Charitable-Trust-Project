import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/mongodb"
import { Content } from "@/lib/models"

export async function HeroSection() {
  noStore()

  await dbConnect()
  const heroContent = await Content.findOne({ type: "hero", isActive: true })
    .sort({ order: 1, updatedAt: -1 })
    .lean()

  const heading = heroContent?.title || "Empowering Lives Through Care & Compassion"
  const subtext =
    heroContent?.content ||
    "We are a children-focused charity organization dedicated to improving young lives through education, healthcare, protection, and community support."

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80"
          alt=""
          className="size-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-primary/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            {subtext}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
            >
              <Link href="/donate" className="flex items-center gap-2">
                Donate Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-primary font-semibold"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
