import type { Metadata } from 'next'
import PageLayout from '@/components/layout/PageLayout'
import ArenaDirectory from '@/components/arena/ArenaDirectory'
import { getArenaChallenges } from '@/lib/arena'

export const metadata: Metadata = {
  title: 'Debugging Challenges | Bug Arena',
  description: 'Search and filter Bug Arena debugging challenges.',
  alternates: { canonical: '/arena/challenges' },
}

export const instant = false

export default async function ArenaChallengesPage() {
  const challenges = await getArenaChallenges()
  return (
    <PageLayout>
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-xs uppercase tracking-widest text-lime">Challenge library</p>
        <h1 className="mt-2 text-4xl font-semibold">Debugging challenges</h1>
        <ArenaDirectory challenges={challenges} />
      </main>
    </PageLayout>
  )
}
