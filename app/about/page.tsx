import type { Metadata } from "next"
import { Heart, Eye, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { OrganizationSchema } from "@/components/seo"

export const metadata: Metadata = {
  title: "About Us – Registered Charitable Trust Under Indian Trust Act, 1882",
  description:
    "Learn about Suraksha Charitable Trust (R) — registered on 3rd January 2022 under Indian Trust Act, 1882. Approved under Section 80G & 12A. Our mission, vision, promoters, and activities for education, healthcare, and community welfare across India.",
  keywords: [
    "about Suraksha Charitable Trust",
    "Suraksha Trust Sirsi Karnataka",
    "Lavina Monteiro",
    "Saver Monteiro",
    "Indian Trust Act 1882 registration",
    "charitable trust India",
    "80G 12A NGO India",
    "registered trust Karnataka",
    "NGO Sirsi",
    "social welfare trust India",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Suraksha Charitable Trust – Registered NGO India",
    description:
      "Registered on 3rd January 2022 under Indian Trust Act, 1882. Section 80G & 12A approved. Serving all humanity through education, healthcare, and community development.",
    url: "https://www.surakshatrustin.org/about",
  },
}

const values = [
  {
    icon: Heart,
    title: "Our Mission",
    description:
      "To render service to all people irrespective of language, race, region, religion, community, caste or creed — promoting welfare of society through education, healthcare, relief to the poor, and cultural development without any profit motive.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To make mankind blossom with excellence and altruism, providing access to education, healthcare, and sustainable livelihood opportunities for the underprivileged.",
  },
]

const stats = [
  { value: "4+", label: "Years of Service" },
  { value: "500+", label: "Lives Impacted" },
  { value: "7+", label: "Total Projects" },
]

const team = [
  { name: "Lavina Saver Monteiro", role: "President & Key Promoter" },
  { name: "Saver Salvador Monteiro", role: "Managing Trustee & Key Promoter" },
]

export default function AboutPage() {
  return (
    <>
      <OrganizationSchema page="about" />
      {/* Hero banner */}
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            srcSet="https://images.unsplash.com/photo-1524069290683-0457abdc3563?w=640&q=75 640w, https://images.unsplash.com/photo-1524069290683-0457abdc3563?w=1200&q=75 1200w, https://images.unsplash.com/photo-1524069290683-0457abdc3563?w=1920&q=75 1920w"
            sizes="100vw"
            src="https://images.unsplash.com/photo-1524069290683-0457abdc3563?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
            crossOrigin="anonymous"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">/ About Us /</span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
           Suraksha Charitable Trust
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
            Registered on 3rd January 2022 under the Indian Trust Act, 1882,
            dedicated to serving all of humanity.
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
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center lg:items-start">
            {/* Image - Left */}
            <div className="relative overflow-hidden rounded-lg lg:-mt-8">
              <img
                src="/images/volunteers.png"
                alt="Community volunteers working together"
                className="size-full rounded-lg object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Text - Right */}
            <div className="flex flex-col justify-center gap-6">
              <span className="text-sm font-medium text-secondary">
                / Our Story /
              </span>
              <h2 className="text-pretty text-3xl font-bold text-foreground sm:text-4xl">
                Our Journey of Service
              </h2>
              <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  Suraksha Charitable Trust (R) was registered on 3rd January
                  2022 under the Indian Trust Act, 1882 to take up activities
                  without any profit motive. It aims at the good of all mankind
                  irrespective of caste, creed, and religion.
                </p>
                <p>
                  The Trust was promoted by Mrs. Lavina Saver Monteiro and Mr.
                  Saver Salvador Monteiro, renowned social workers and
                  philanthropists who have been involved in various social
                  organizations and institutions, imparting charitable activities
                  for the welfare of mankind.
                </p>
                <p>
                  The Trust primarily engages in Relief of the Poor, Education,
                  Student Hostel, Old Age Home and Orphans, Medical Relief,
                  promotion of Indian Classical Dance, Music, Art, Culture,
                  Literature, Science, Sports, Health, Environmental protection,
                  and creating awareness on environmental and ecological
                  developments for public benefit.
                </p>
                <p>
                  The Trust has successfully carried out its own programmes
                  without expecting any publicity, and continues to broaden its
                  objectives to carry out tremendous activities for the
                  betterment of society.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex w-full flex-col items-center gap-1 text-center sm:w-auto sm:min-w-44"
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

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex w-full flex-col items-center gap-3 text-center sm:w-auto sm:min-w-52"
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
                title: "Service to All",
                desc: "We serve all people irrespective of language, race, region, religion, community, caste, or creed.",
              },
              {
                icon: Target,
                title: "Selfless Service",
                desc: "We carry out our activities without any profit motive and without expecting any publicity.",
              },
              {
                icon: Users,
                title: "Community Welfare",
                desc: "We believe in the power of collective action to create lasting change for the underprivileged.",
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
