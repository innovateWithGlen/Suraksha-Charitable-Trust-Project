import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBannerSection() {
  return (
    <section id="donate" className="bg-secondary py-16 lg:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="text-balance text-3xl font-bold text-secondary-foreground sm:text-4xl">
          Make a Difference Today
        </h2>
        <p className="max-w-xl text-base text-secondary-foreground/80 leading-relaxed">
          Your contribution helps us reach more communities, educate more
          children, and build a brighter future for all. Every donation counts.
        </p>
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
      </div>
    </section>
  )
}
