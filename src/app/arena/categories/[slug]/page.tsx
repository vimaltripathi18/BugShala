import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import ArenaDirectory from '@/components/arena/ArenaDirectory'
import { getArenaCategories, getArenaChallenges } from '@/lib/arena'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = (await getArenaCategories()).find(item => item.slug === slug)
  return category ? { title: `${category.name} | Bug Arena`, description: category.description, alternates: { canonical: `/arena/categories/${slug}` } } : {}
}

export const instant = false

export default async function ArenaCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const categories = await getArenaCategories()
  const category = categories.find(item => item.slug === slug)
  if (!category) notFound()
  const challenges = (await getArenaChallenges()).filter(challenge => challenge.category?.slug === slug)
  return (
    <PageLayout>
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="text-xs uppercase tracking-widest text-lime">Arena category</p>
        <h1 className="mt-2 text-4xl font-semibold">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">{category.description}</p>
        <ArenaDirectory challenges={challenges} />
      </main>
    </PageLayout>
  )
}
