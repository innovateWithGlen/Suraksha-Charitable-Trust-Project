import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Suraksha Charitable Trust. Phone: +91 7892351129, Email: savermonteiro@gmail.com. Visit us at Sirsi, Karnataka, India.",
  keywords: [
    "contact Suraksha Trust",
    "NGO Sirsi Karnataka",
    "charitable trust contact",
    "donate phone number",
  ],
  openGraph: {
    title: "Contact Us | Suraksha Charitable Trust",
    description:
      "Phone, email, address, and working hours for Suraksha Charitable Trust.",
    url: "https://www.surakshatrustin.org/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
