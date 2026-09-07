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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:px-6">
        {partners.map((partner) => (
          <span
            key={partner}
            className="text-xs font-bold tracking-wider text-accent-foreground/70 uppercase sm:text-sm"
          >
            {partner}
          </span>
        ))}
      </div>
    </section>
  )
}
