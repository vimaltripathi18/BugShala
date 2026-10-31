import { notFound } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import BugCard from '@/components/bugs/BugCard'
import { getTechnologyBySlug, getBugs, getTechnologies } from '@/lib/database/bugs'
export async function generateStaticParams() { return (await getTechnologies()).map(({ slug }) => ({ slug })) }

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const technology = await getTechnologyBySlug(slug)
  if (!technology) notFound()
  const { bugs } = await getBugs({ technology: [slug] })
  return <PageLayout><div className="mx-auto max-w-7xl px-6 py-14"><div className="max-w-3xl"><p className="text-xs uppercase tracking-widest text-lime">Technology</p><h1 className="mt-2 text-4xl font-semibold">{technology.name} errors & fixes</h1><p className="mt-4 text-lg text-text-secondary">{technology.description}</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{bugs.map(bug => <BugCard key={bug.id} bug={bug} />)}</div></div></PageLayout>
}
export const instant = false
