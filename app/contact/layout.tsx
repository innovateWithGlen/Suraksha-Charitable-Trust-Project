import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us – Get in Touch with Suraksha Charitable Trust",
  description:
    "Contact Suraksha Charitable Trust (R) – Registered NGO under Indian Trust Act, 1882. Phone: +91 7892351129, Email: savermonteiro@gmail.com. Visit us at Sirsi, Karnataka, India. 80G & 12A approved trust.",
  keywords: [
    "contact Suraksha Trust",
    "contact charitable trust India",
    "NGO Sirsi Karnataka",
    "charitable trust phone number India",
    "donate phone number India",
    "NGO contact India",
    "Suraksha Charitable Trust address",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Suraksha Charitable Trust – NGO India",
    description:
      "Phone, email, address, and working hours for Suraksha Charitable Trust. Registered NGO under Indian Trust Act, 1882.",
    url: "https://www.surakshatrustin.org/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
