import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BugShala — Every bug has a lesson.',
    template: '%s | BugShala',
  },
  description: 'Understand errors, discover reliable fixes, and become a better developer with practical debugging guides.',
  keywords: ['debugging', 'programming errors', 'JavaScript errors', 'React bugs', 'developer tools'],
  authors: [{ name: 'BugShala' }],
  creator: 'BugShala',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bugshala.com',
    siteName: 'BugShala',
    title: 'BugShala — Every bug has a lesson.',
    description: 'Understand errors, discover reliable fixes, and become a better developer with practical debugging guides.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BugShala — Every bug has a lesson.',
    description: 'Understand errors, discover reliable fixes, and become a better developer with practical debugging guides.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jetbrainsMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" style={{ backgroundColor: '#0D0E12', color: '#E7E9EE' }}>
        {children}
      </body>
    </html>
  )
}
