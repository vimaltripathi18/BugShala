import type { Metadata } from 'next'
import PageLayout from '@/components/layout/PageLayout'
import DevKitDirectory from '@/components/devkit/DevKitDirectory'

export const metadata: Metadata = {
  title: 'Developer Tools',
  description: 'Free browser-based utilities for JSON, encoding, security, regex, colors, dates, and code formatting.',
  alternates: { canonical: '/devkit' },
}

export const instant = false

export default function DevKitPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-xs uppercase tracking-widest text-lime">Developer utilities</p>
        <h1 className="mt-2 text-4xl font-semibold">DevKit</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">Fast, private, browser-based utilities for everyday development work.</p>

        <DevKitDirectory />
      </div>
    </PageLayout>
  )
}
