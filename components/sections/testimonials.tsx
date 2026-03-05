import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Suraksha Trust gave my daughter the opportunity to attend school. We are forever grateful for their support and kindness.",
    name: "Meera Devi",
    role: "Parent & Beneficiary",
  },
  {
    quote:
      "Volunteering with Suraksha has been one of the most rewarding experiences of my life. The impact they make is truly remarkable.",
    name: "Rahul Sharma",
    role: "Volunteer",
  },
  {
    quote:
      "Their healthcare camps in our village have made a real difference. Many families now have access to basic medical care.",
    name: "Dr. Priya Patel",
    role: "Partner Doctor",
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="text-sm font-medium text-secondary">/ Testimonials /</span>
          <h2 className="mt-2 text-pretty text-3xl font-bold text-foreground sm:text-4xl">
            What People Say
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card border-border">
              <CardContent className="flex flex-col gap-4 pt-6">
                <Quote className="size-8 text-accent" />
                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  {`"${testimonial.quote}"`}
                </p>
                <div className="mt-auto pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
