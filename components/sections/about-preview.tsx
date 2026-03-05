import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { value: "10+", label: "Years of Service" },
  { value: "5,000+", label: "Lives Impacted" },
  { value: "200+", label: "Volunteers" },
  { value: "50+", label: "Projects Completed" },
]

export function AboutPreviewSection() {
  return (
    <section id="about" className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <span className="text-sm font-medium text-secondary">/ About Us /</span>
        <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
          About Suraksha Charitable Trust
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div className="flex flex-col justify-center gap-6">
            <p className="text-base leading-relaxed text-muted-foreground">
              Founded with a vision to empower the underprivileged, Suraksha
              Charitable Trust has been at the forefront of community
              development for over a decade. We believe every child deserves
              access to quality education, healthcare, and a safe environment.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Our programs span across education, healthcare outreach,
              environmental initiatives, and community welfare, touching
              thousands of lives across India.
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
          <div className="relative overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80"
              alt="Children learning in a community classroom"
              className="size-full rounded-lg object-cover"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 rounded-lg bg-card p-6 text-center shadow-sm border border-border"
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
