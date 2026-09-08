import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery & Events",
  description:
    "View photos and events from Suraksha Charitable Trust programs — education, healthcare, community development, and cultural activities.",
  keywords: [
    "NGO events India",
    "charitable trust photos",
    "community events Sirsi",
    "education program photos",
    "healthcare camp photos",
  ],
  openGraph: {
    title: "Gallery & Events | Suraksha Charitable Trust",
    description:
      "Photos and events from our education, healthcare, and community programs.",
    url: "https://www.surakshatrustin.org/gallery",
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
