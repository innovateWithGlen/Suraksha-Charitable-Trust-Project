import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { value: "4+", label: "Years of Service" },
  { value: "500+", label: "Lives Impacted" },
  { value: "7+", label: "Total Projects" },
]

export function AboutPreviewSection() {
  return (
    <section id="about" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <span className="text-sm font-medium text-secondary">/ About Us /</span>
        <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
          About Suraksha Charitable Trust
        </h2>

        <div className="mt-10 lg:mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16 items-center lg:items-start">
          {/* Text */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              Suraksha Charitable Trust (R) was registered on 3rd January 2022
              under the Indian Trust Act, 1882. Founded with a vision to make
              mankind blossom with excellence and altruism, we serve all people
              irrespective of caste, creed, and religion.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Our programs span across education, healthcare, relief to the
              poor, environmental protection, and cultural development —
              touching lives in Sirsi and beyond without any profit motive.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-fit border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              <Link href="/about" className="flex items-center gap-2">
                Learn More
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative overflow-hidden rounded-lg lg:-mt-8">
            <img
              src="/images/9.jpeg"
              alt="Children learning in a community classroom"
              className="size-full rounded-lg object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex w-full flex-col items-center gap-1 rounded-lg bg-card p-6 text-center shadow-sm border border-border sm:w-auto sm:min-w-40 sm:flex-1 sm:max-w-xs"
            >
              <span className="text-3xl font-bold text-secondary">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
