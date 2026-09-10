import type { Metadata } from "next"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import {
  GraduationCap,
  HeartPulse,
  TreePine,
  Baby,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/mongodb"
import { Content } from "@/lib/models"
import { OrganizationSchema } from "@/components/seo"

export const metadata: Metadata = {
  title: "What We Do – Programs & Initiatives | Education, Healthcare & Community Development",
  description:
    "Explore Suraksha Charitable Trust programs: education development, medical relief, relief to the poor, women empowerment, child welfare, environmental protection, and cultural activities across India. CSR-1 registered NGO.",
  keywords: [
    "NGO programs India",
    "education development NGO India",
    "medical relief charity India",
    "free medical camp India",
    "relief to poor India",
    "women empowerment NGO India",
    "child welfare programs India",
    "cultural activities trust India",
    "community development India",
    "environmental protection NGO",
    "Suraksha Trust programs",
  ],
  alternates: {
    canonical: "/what-we-do",
  },
  openGraph: {
    title: "What We Do | Suraksha Charitable Trust – NGO Programs India",
    description:
      "Education, medical relief, community welfare, women empowerment, child welfare, and cultural development programs across India.",
    url: "https://www.surakshatrustin.org/what-we-do",
  },
}

const corePrograms = [
  {
    icon: GraduationCap,
    title: "Education Development",
    description:
      "The Trust aims to provide education by establishing and running schools, colleges, Industrial Training Centers, Vocational colleges, and Professional colleges — creating employment opportunities for disabled, orphans, and economically backward sections of society. We provide basic education to backward communities and tribes, educate on government schemes, empower women, and organize workshops on entrepreneurship development.",
    highlights: [
      "Scholarship programme for underprivileged students",
      "Distribution of books, notebooks, clothes, uniforms & meals",
      "Workshops on entrepreneurship and self-employment",
      "Vocational training for school dropouts",
    ],
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    imageAlt: "Children studying in a classroom",
  },
  {
    icon: HeartPulse,
    title: "Medical Relief & Healthcare",
    description:
      "The Trust provides financial assistance to poor people who are economically disadvantaged — paying for daily routine medications, surgery bills, and other related activities. We organize medical camps, health awareness drives, and provide essential medicines to underserved populations.",
    highlights: [
      "Financial assistance for surgeries and medications",
      "Free medical camps for underserved communities",
      "Maternal and child health programs",
      "Health awareness and hygiene education",
    ],
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    imageAlt: "Healthcare workers attending to patients",
  },
  {
    icon: TreePine,
    title: "Relief to Poor & Environmental Protection",
    description:
      "The Trust helps financially disadvantaged people with everyday items, housing, and business support. We develop community and natural resources for sustainable development, preserve natural resources, and create awareness on environmental and ecological developments.",
    highlights: [
      "Financial assistance for housing and residential sites",
      "Distribution of essentials to the poor and indigent",
      "Environmental awareness and ecological development",
      "Preservation of natural resources — land, water & vegetation",
    ],
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
    imageAlt: "Volunteers planting trees in a community garden",
  },
]

const welfarePrograms = [
  {
    icon: Baby,
    title: "Child Welfare & Orphans",
    description:
      "Providing basic infrastructure, education facilities to orphans, and all facilities for betterment of their life. We run childcare centers, nutrition programs, and child protection initiatives to ensure the well-being of young lives.",
    highlights: [
      "Support for orphaned children and student hostels",
      "Nutrition and education programs for children",
      "Mattress & blanket distribution to hostel boys",
      "Sponsorship programs for underprivileged youth",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Women Empowerment",
    description:
      "Educating and empowering women through skill development training, self-help group support, legal aid, and entrepreneurship programs for women from marginalized backgrounds.",
    highlights: [
      "Workshops on entrepreneurship development",
      "Self-help group formation and support",
      "Legal awareness and aid programs",
      "Skill development and vocational training",
    ],
  },
  {
    icon: Users,
    title: "Religious & Cultural Activities",
    description:
      "The Trust provides financial assistance to people of all religions to conduct religious activities. We conduct programs, seminars, training camps, and workshops in Indian Classical Dance, Music, Art, Culture, Literature, Science, Sports, and Health.",
    highlights: [
      "Promotion of Indian Classical Dance, Music & Art",
      "Cultural awareness programs in rural regions",
      "Training institutes for arts and culture",
      "Sports tournaments and healthy lifestyle promotion",
    ],
  },
]

const impactStats = [
  { value: "500+", label: "Lives Impacted" },
  { value: "3+", label: "Active Projects" },
  { value: "5+", label: "Communities Served" },
  { value: "20+", label: "Active Volunteers" },
]

export default async function WhatWeDoPage() {
  noStore()

  await dbConnect()
  const programDocs = await Content.find({ type: "program", isActive: true })
    .sort({ order: 1, updatedAt: -1 })
    .lean()

  const dynamicCorePrograms = corePrograms.map((program, index) => ({
    ...program,
    title: programDocs[index]?.title || program.title,
    description: programDocs[index]?.content || program.description,
  }))

  return (
    <>
      <OrganizationSchema page="what-we-do" />
      {/* Hero banner */}
      <section className="relative flex items-center overflow-hidden bg-primary py-20 lg:py-28">
        <div className="absolute inset-0">
          <img
            srcSet="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=640&q=75 640w, https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=75 1200w, https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=75 1920w"
            sizes="100vw"
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80"
            alt=""
            className="size-full object-cover opacity-20"
            crossOrigin="anonymous"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm font-medium text-accent">
            / Our Programs /
          </span>
          <h1 className="mt-2 text-balance text-4xl font-bold text-primary-foreground sm:text-5xl">
            What We Do
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
            From education and medical relief to cultural development and
            environmental protection — we create lasting impact where it
            matters most.
          </p>
        </div>
      </section>

      {/* Core Programs - Alternating layout */}
      <section className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-sm font-medium text-secondary">
              / Core Focus Areas /
            </span>
            <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
              Education, Healthcare & Community Development
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Our core programs address the most fundamental needs of
              underprivileged communities across India.
            </p>
          </div>

          <div className="mt-16 flex flex-col gap-20">
            {dynamicCorePrograms.map((program, index) => {
              const Icon = program.icon
              const isReversed = index % 2 !== 0
              return (
                <div
                  key={program.title}
                  className={`grid gap-10 lg:grid-cols-2 lg:gap-16 items-center ${isReversed ? "lg:[direction:rtl]" : ""}`}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={program.image}
                      alt={program.imageAlt}
                      className="aspect-[4/3] w-full rounded-lg object-cover"
                      crossOrigin="anonymous"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div
                    className={`flex flex-col gap-5 ${isReversed ? "lg:[direction:ltr]" : ""}`}
                  >
                    <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {program.title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                    <ul className="flex flex-col gap-2.5">
                      {program.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm text-foreground/80"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {impactStats.map((stat) => (
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

      {/* Women & Child Welfare */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <span className="text-sm font-medium text-secondary">
              / Welfare Programs /
            </span>
            <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
              Welfare & Cultural Programs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Supporting children, women, and cultural development — building a
              better future for all.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {welfarePrograms.map((program) => {
              const Icon = program.icon
              return (
                <Card
                  key={program.title}
                  className="bg-card border-border transition-shadow hover:shadow-md"
                >
                  <CardHeader>
                    <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                      <Icon className="size-6" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {program.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {program.highlights.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-foreground/80"
                        >
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-secondary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-pretty text-3xl font-bold text-accent-foreground sm:text-4xl">
            Want to Get Involved?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-accent-foreground/80 leading-relaxed">
            Whether you want to volunteer, donate, or partner with us, there are
            many ways to support our mission.
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
    </>
  )
}
