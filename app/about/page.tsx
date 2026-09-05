import type { Metadata } from "next"
import { Heart, Eye, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About Us | Suraksha Charitable Trust",
  description:
    "Learn about our mission, vision, and the team behind Suraksha Charitable Trust.",
}

const values = [
  {
    icon: Heart,
    title: "Our Mission",
    description:
      "To empower underprivileged communities by providing access to education, healthcare, and sustainable livelihood opportunities.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "A world where every individual, regardless of background, has the opportunity to live a dignified and fulfilling life.",
  },
]

const stats = [
  { value: "4+", label: "Years of Service" },
  { value: "5,00+", label: "Lives Impacted" },
  // { value: "200+", label: "Volunteers" },
  { value: "7+", label: "Projects Completed" },
]

const team = [
  { name: "Saver Monteiro", role: "Founder & Managing Trustee" },
  { name: "Lavina Monteiro", role: "President" },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero banner */}
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524069290683-0457abdc3563?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
            crossOrigin="anonymous"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">/ About Us /</span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
            About Suraksha Charitable Trust
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
            Dedicated to transforming lives and building stronger communities
            since 2015.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {values.map((item) => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="bg-card border-border">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <Icon className="size-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                      {item.title}
                    </h2>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80"
                alt="Community volunteers working together"
                className="size-full rounded-lg object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex flex-col gap-6">
              <span className="text-sm font-medium text-secondary">
                / Our Story /
              </span>
              <h2 className="text-pretty text-3xl font-bold text-foreground sm:text-4xl">
                A Decade of Making a Difference
              </h2>
              <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Suraksha Charitable Trust was founded in 2015 by a group of
                  passionate individuals who believed that everyone deserves a
                  fair chance at life. What started as a small community
                  initiative in a single village has grown into a movement
                  touching thousands of lives.
                </p>
                <p>
                  Over the years, we have expanded our reach across multiple
                  states, partnering with local organizations, government
                  bodies, and international NGOs to amplify our impact. Our
                  focus remains on education, healthcare, environmental
                  sustainability, and community empowerment.
                </p>
                <p>
                  Today, Suraksha Trust stands as a beacon of hope for
                  countless families, and we continue to grow, driven by the
                  belief that collective action creates lasting change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <span className="text-3xl font-bold text-secondary-foreground sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-secondary-foreground/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-sm font-medium text-secondary">
              / Our Team /
            </span>
            <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
              The People Behind Suraksha
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Meet our dedicated leadership team driving impact and change
              across communities.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="flex size-24 items-center justify-center rounded-full bg-muted">
                  <Users className="size-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-sm font-medium text-secondary">
              / Our Values /
            </span>
            <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
              What Guides Us
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Compassion",
                desc: "We lead with empathy and kindness in every interaction.",
              },
              {
                icon: Target,
                title: "Integrity",
                desc: "Transparency and honesty guide all our decisions and actions.",
              },
              {
                icon: Users,
                title: "Community",
                desc: "We believe in the power of people coming together for change.",
              },
            ].map((value) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="flex flex-col items-center gap-3 rounded-lg bg-card p-8 text-center border border-border"
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
