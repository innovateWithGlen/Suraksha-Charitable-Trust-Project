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
    default: "Suraksha Charitable Trust | NGO for Education, Healthcare & Community Development",
    template: "%s | Suraksha Charitable Trust",
  },
  description:
    "Suraksha Charitable Trust (R) is a registered NGO under Indian Trust Act, 1882. We serve all humanity through education, healthcare, relief to the poor, and cultural development. Donate under Section 80G.",
  keywords: [
    "Suraksha Charitable Trust",
    "NGO India",
    "charitable trust India",
    "donate India",
    "80G donation",
    "tax deductible donation India",
    "education for underprivileged",
    "healthcare for poor",
    "CSR projects India",
    "corporate social responsibility",
    "community development India",
    "women empowerment NGO",
    "child welfare India",
    "relief to poor",
    "Sirsi Karnataka NGO",
    "Indian Trust Act 1882",
    "donate online India",
    "Section 80G certificate",
  ],
  authors: [{ name: "Suraksha Charitable Trust" }],
  creator: "Suraksha Charitable Trust",
  publisher: "Suraksha Charitable Trust",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Suraksha Charitable Trust",
    title: "Suraksha Charitable Trust | NGO for Education, Healthcare & Community Development",
    description:
      "Registered NGO under Indian Trust Act, 1882. Donate under Section 80G. Supporting education, healthcare, and community development across India.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Suraksha Charitable Trust Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suraksha Charitable Trust | NGO for Education & Healthcare",
    description:
      "Registered NGO under Indian Trust Act, 1882. Donate under Section 80G. Supporting education, healthcare, and community development.",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/images/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
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
