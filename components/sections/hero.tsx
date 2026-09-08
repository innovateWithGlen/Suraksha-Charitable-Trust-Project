import Link from "next/link"
import Image from "next/image"
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

  const heading = heroContent?.title || "Suraksha Charitable Trust (R)"
  const subtext =
    heroContent?.content ||
    "Registered on 3rd January 2022 under the Indian Trust Act, 1882 — serving all of humanity through education, healthcare, relief to the poor, and cultural development without any profit motive."

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-white sm:min-h-[75vh] lg:min-h-[80vh]">
      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
        {/* Logo */}
        <Image
          src="/images/logo.svg"
          alt="Suraksha Charitable Trust logo"
          width={650}
          height={509}
          priority
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 40vw, 320px"
          className="h-[180px] w-auto object-contain sm:h-[240px] lg:h-[300px]"
        />

        {/* Title, subtext, buttons */}
        <div>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {heading}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base lg:text-lg">
            {subtext}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
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
