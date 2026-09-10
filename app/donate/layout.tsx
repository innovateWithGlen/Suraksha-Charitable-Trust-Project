import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donate Online – Tax-Deductible Donation Under Section 80G",
  description:
    "Make a tax-deductible donation to Suraksha Charitable Trust under Section 80G of Income Tax Act. Support education, healthcare, and community development. UPI, cards, net banking accepted. 12A registered NGO.",
  keywords: [
    "donate India",
    "80G donation India",
    "tax deductible donation India",
    "donate online India",
    "charitable donation online",
    "NGO donation India",
    "Suraksha Trust donate",
    "UPI donation India",
    "Section 80G certificate",
    "12A registered NGO donation",
    "best NGO to donate India",
  ],
  alternates: {
    canonical: "/donate",
  },
  openGraph: {
    title: "Donate Online | Suraksha Charitable Trust – 80G Tax Benefits",
    description:
      "Make a tax-deductible donation under Section 80G. Support education, healthcare, and community development. 12A registered NGO.",
    url: "https://www.surakshatrustin.org/donate",
  },
}

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
