const partners = [
  "EduFirst",
  "HealthBridge",
  "GreenFuture",
  "CareConnect",
  "SafeHands",
  "BrightPath",
]

export function PartnersSection() {
  return (
    <section className="border-y border-border bg-muted/50 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 sm:gap-x-12 lg:gap-x-16">
          {partners.map((partner) => (
            <span
              key={partner}
              className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase sm:text-sm"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
