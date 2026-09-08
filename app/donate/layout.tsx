import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Make a tax-deductible donation to Suraksha Charitable Trust under Section 80G. Support education, healthcare, and community development. UPI, cards, net banking accepted.",
  keywords: [
    "donate India",
    "80G donation",
    "tax deductible donation",
    "charitable donation online",
    "NGO donation India",
    "Suraksha Trust donate",
    "UPI donation",
    "Section 80G certificate",
  ],
  openGraph: {
    title: "Donate | Suraksha Charitable Trust",
    description:
      "Make a tax-deductible donation under Section 80G. Support education, healthcare, and community development.",
    url: "https://www.surakshatrustin.org/donate",
  },
}

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
