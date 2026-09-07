import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProviders } from '@/components/app-providers'
import { LayoutWrapper } from '@/components/layout-wrapper'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Suraksha Charitable Trust',
  description: 'Empowering lives through education, healthcare, protection, and community support. Join Suraksha Charitable Trust in making a difference.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/images/logo.svg',
        type: 'image/svg+xml',
      },
    ],
  },
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
