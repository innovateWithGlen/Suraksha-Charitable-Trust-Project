import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery & Events – Photos from Our Programs",
  description:
    "View photos and events from Suraksha Charitable Trust programs — education drives, medical camps, community development events, women empowerment workshops, and cultural activities across India.",
  keywords: [
    "NGO events India",
    "charitable trust photos India",
    "community events Sirsi Karnataka",
    "education program photos India",
    "healthcare camp photos India",
    "Suraksha Trust events",
    "NGO photo gallery India",
  ],
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Gallery & Events | Suraksha Charitable Trust – NGO India",
    description:
      "Photos and events from our education, healthcare, community development, and cultural programs across India.",
    url: "https://www.surakshatrustin.org/gallery",
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
