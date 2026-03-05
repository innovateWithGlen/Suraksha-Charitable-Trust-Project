import { HeroSection } from "@/components/sections/hero"
import { PartnersSection } from "@/components/sections/partners"
import { AboutPreviewSection } from "@/components/sections/about-preview"
import { WhatWeDoSection } from "@/components/sections/what-we-do"
import { TestimonialsSection } from "@/components/sections/testimonials"
import { CtaBannerSection } from "@/components/sections/cta-banner"

export default function Home() {
  return (
    <>
      <HeroSection />
      <PartnersSection />
      <AboutPreviewSection />
      <WhatWeDoSection />
      <TestimonialsSection />
      <CtaBannerSection />
    </>
  )
}
