import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/app-providers'
import { LayoutWrapper } from '@/components/layout-wrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_URL = "https://www.surakshatrustin.org"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Suraksha Charitable Trust | Registered NGO India – Education, Healthcare & Community Development",
    template: "%s | Suraksha Charitable Trust (R) – NGO India",
  },
  description:
    "Suraksha Charitable Trust (R) is a registered charitable trust under Indian Trust Act, 1882 (Reg. No. 1882). Approved under Section 80G & 12A of Income Tax Act. CSR-1 registered NGO serving India through education, healthcare, relief to the poor, women empowerment, child welfare, and cultural development. Donate online with tax benefits.",
  keywords: [
    "Suraksha Charitable Trust",
    "Suraksha Trust",
    "charitable trust in India",
    "NGO in India",
    "best NGO India",
    "top charitable trust India",
    "donate to NGO India",
    "80G donation India",
    "tax deductible donation India",
    "Section 80G certificate",
    "12A registered NGO",
    "CSR-1 registered trust",
    "education for underprivileged India",
    "healthcare for poor India",
    "free medical camp India",
    "women empowerment NGO India",
    "child welfare NGO India",
    "relief to poor India",
    "community development India",
    "corporate social responsibility India",
    "CSR projects India",
    "adopt a project NGO",
    "donate online India",
    "Sirsi Karnataka NGO",
    "NGO Karnataka",
    "Indian Trust Act 1882",
    "charitable trust registration India",
    "non profit organization India",
    "social welfare trust India",
    "Suraksha Charitable Trust Sirsi",
  ],
  authors: [{ name: "Suraksha Charitable Trust" }],
  creator: "Suraksha Charitable Trust",
  publisher: "Suraksha Charitable Trust",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Suraksha Charitable Trust",
    title: "Suraksha Charitable Trust | Registered NGO India – Education, Healthcare & Community Development",
    description:
      "Registered charitable trust under Indian Trust Act, 1882. Section 80G & 12A approved. CSR-1 registered NGO serving India through education, healthcare, and community development. Donate with tax benefits.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Suraksha Charitable Trust - Registered NGO India",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suraksha Charitable Trust | Registered NGO India – Education & Healthcare",
    description:
      "Registered charitable trust under Indian Trust Act, 1882. Section 80G & 12A approved. CSR-1 registered. Donate with tax benefits.",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
