import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CSR Projects – Corporate Partnership & Project Suggestions",
  description:
    "Explore open CSR projects at Suraksha Charitable Trust for corporate social responsibility (CSR) partnerships. Companies can adopt projects or suggest new CSR initiatives under Companies Act, 2013. Education, healthcare, environment & empowerment projects available.",
  keywords: [
    "CSR projects India",
    "CSR partnership India",
    "corporate social responsibility India",
    "suggest CSR project",
    "CSR project proposal",
    "company CSR donation",
    "CSR-1 registered trust",
    "corporate sponsorship India",
    "CSR education project",
    "CSR healthcare project",
    "Suraksha Trust CSR",
    "CSR compliance India",
    "suggest NGO project",
  ],
  alternates: {
    canonical: "/adopt-project",
  },
  openGraph: {
    title: "CSR Projects | Suraksha Charitable Trust – Corporate Partnership",
    description:
      "Explore open CSR projects or suggest your own initiative. Corporate social responsibility partnership for education, healthcare, environment & empowerment.",
    url: "https://www.surakshatrustin.org/adopt-project",
  },
}

export default function AdoptProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
