import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import ArenaChallenge from '@/components/arena/ArenaChallenge'
import { getArenaChallenge } from '@/lib/arena'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const challenge = await getArenaChallenge(slug)
  return challenge ? { title: challenge.title, description: challenge.description, alternates: { canonical: `/arena/challenges/${slug}` } } : {}
}

export const instant = false

export default async function ArenaChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const challenge = await getArenaChallenge(slug)
  if (!challenge) notFound()

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-xs uppercase tracking-widest text-lime">{challenge.category?.name ?? 'Bug Arena'}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">{challenge.title}</h1>
          <span className="rounded-md border border-border px-3 py-1 text-xs capitalize">{challenge.difficulty}</span>
        </div>
        <p className="mt-4 max-w-3xl text-text-secondary">{challenge.problem_statement}</p>
        <section className="mt-8">
          <ArenaChallenge challenge={challenge} />
        </section>
      </div>
    </PageLayout>
  )
}
