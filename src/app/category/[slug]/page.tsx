import { notFound } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import BugCard from '@/components/bugs/BugCard'
import { getCategoryBySlug, getBugs, getCategories } from '@/lib/database/bugs'
export async function generateStaticParams() { return (await getCategories()).map(({ slug }) => ({ slug })) }

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()
  const { bugs } = await getBugs({ category: [slug] })
  return <PageLayout><div className="mx-auto max-w-7xl px-6 py-14"><div className="max-w-3xl"><p className="text-xs uppercase tracking-widest text-lime">Category</p><h1 className="mt-2 text-4xl font-semibold">{category.name}</h1><p className="mt-4 text-lg text-text-secondary">{category.description}</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{bugs.map(bug => <BugCard key={bug.id} bug={bug} />)}</div></div></PageLayout>
}
export const instant = false
