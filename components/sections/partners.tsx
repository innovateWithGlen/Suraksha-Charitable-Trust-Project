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
    <section className="bg-accent py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 overflow-x-auto px-6">
        {partners.map((partner) => (
          <span
            key={partner}
            className="shrink-0 text-sm font-bold tracking-wider text-accent-foreground/70 uppercase"
          >
            {partner}
          </span>
        ))}
      </div>
    </section>
  )
}
