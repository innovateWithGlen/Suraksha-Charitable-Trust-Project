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
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-white">
      {/* Background logo watermark */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-end pr-8">
          <img
            src="/images/logo.png"
            alt=""
            className="h-[min(85vh,720px)] w-auto animate-[hero-breathe_12s_ease-in-out_infinite] object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-20 md:py-28">
        <div className="max-w-2xl animate-[hero-fade-up_0.9s_ease-out_both]">
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            {subtext}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-[#1f78e5] font-semibold text-white shadow-lg shadow-[#1f78e5]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1665c4] hover:shadow-xl hover:shadow-[#1f78e5]/40"
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
              className="border-2 border-slate-900 font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
