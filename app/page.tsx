import { HeroSection } from "@/components/sections/hero"
import { PartnersSection } from "@/components/sections/partners"
import { AboutPreviewSection } from "@/components/sections/about-preview"
import { WhatWeDoSection } from "@/components/sections/what-we-do"
import { TestimonialsSection } from "@/components/sections/testimonials"
import { CtaBannerSection } from "@/components/sections/cta-banner"
import { OrganizationSchema } from "@/components/seo"

export default function Home() {
  return (
    <>
      <OrganizationSchema page="home" />
      <HeroSection />
      <PartnersSection />
      <AboutPreviewSection />
      <WhatWeDoSection />
      <TestimonialsSection />
      <CtaBannerSection />
    </>
  )
}
