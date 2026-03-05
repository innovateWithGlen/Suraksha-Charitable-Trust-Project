import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { GraduationCap, HeartPulse, TreePine, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dbConnect from "@/lib/mongodb"
import { Content } from "@/lib/models"

const fallbackPrograms = [
  {
    icon: GraduationCap,
    title: "Education Support",
    description:
      "Providing scholarships, school supplies, and tutoring programs to help underprivileged children access quality education.",
  },
  {
    icon: HeartPulse,
    title: "Healthcare Outreach",
    description:
      "Organizing medical camps, health awareness drives, and providing essential medicines to underserved communities.",
  },
  {
    icon: TreePine,
    title: "Environmental Care",
    description:
      "Leading tree plantation drives, clean water initiatives, and sustainability workshops to protect our environment.",
  },
]

export async function WhatWeDoSection() {
  noStore()

  await dbConnect()

  const programDocs = await Content.find({ type: "program", isActive: true })
    .sort({ order: 1, updatedAt: -1 })
    .lean()

  const iconCycle = [GraduationCap, HeartPulse, TreePine]

  const programs =
    programDocs.length > 0
      ? programDocs.slice(0, 3).map((program, index) => ({
          icon: iconCycle[index % iconCycle.length],
          title: program.title,
          description: program.content,
        }))
      : fallbackPrograms

  return (
    <section id="what-we-do" className="bg-muted py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-secondary">/ What We Do /</span>
          <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
            Our Programs & Initiatives
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Through our dedicated programs, we address the most pressing needs
            of vulnerable communities and create lasting change.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon
            return (
              <Card
                key={program.title}
                className="group flex flex-col bg-card border-border transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    {program.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-fit border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-medium"
                  >
                    <Link href="/gallery" className="flex items-center gap-2">
                      Learn More
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
