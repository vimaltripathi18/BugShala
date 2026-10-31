import type { Metadata } from 'next'
import PageLayout from '@/components/layout/PageLayout'
import { getArenaChallenges } from '@/lib/arena'
import ArenaDirectory from '@/components/arena/ArenaDirectory'

export const metadata: Metadata = {
  title: 'Bug Arena',
  description: 'Practice debugging with focused programming challenges.',
  alternates: { canonical: '/arena' },
}

export const instant = false

export default async function ArenaPage() {
  const challenges = await getArenaChallenges()

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-xs uppercase tracking-widest text-lime">Interactive debugging</p>
        <h1 className="mt-2 text-4xl font-semibold">Enter the Bug Arena</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">Find the bug, understand the problem, and fix the code.</p>
        <ArenaDirectory challenges={challenges} />
      </div>
    </PageLayout>
  )
}
