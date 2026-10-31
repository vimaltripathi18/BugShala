import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import BugCard from '@/components/bugs/BugCard'
export const instant = false
import { getBugs, getTechnologies, getCategories } from '@/lib/database/bugs'

interface Props { searchParams: Promise<{ q?: string; technology?: string; category?: string; difficulty?: string; sort?: string }> }

export default async function BugLibrary({ searchParams }: Props) {
  const params = await searchParams
  const split = (value?: string) => value?.split(',').filter(Boolean)
  const [{ bugs, meta }, technologies, categories] = await Promise.all([
    getBugs({ q: params.q, technology: split(params.technology), category: split(params.category), difficulty: split(params.difficulty), sort: params.sort }),
    getTechnologies(), getCategories(),
  ])

  return <PageLayout><div className="mx-auto max-w-7xl px-6 py-14"><div className="mb-10"><p className="text-xs uppercase tracking-widest text-lime">Knowledge base</p><h1 className="mt-2 text-4xl font-semibold">Bug Library</h1><p className="mt-3 text-text-secondary">Practical explanations and verified fixes for the errors developers encounter.</p></div><div className="grid gap-8 lg:grid-cols-[220px_1fr]"><aside className="space-y-6"><div><h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Technology</h2><div className="space-y-1">{technologies.map(t => <Link key={t.id} href={`/bugs?technology=${t.slug}`} className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface hover:text-lime">{t.name}</Link>)}</div></div><div><h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Category</h2><div className="space-y-1">{categories.map(c => <Link key={c.id} href={`/bugs?category=${c.slug}`} className="block rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface hover:text-lime">{c.name}</Link>)}</div></div></aside><main><div className="mb-5 flex items-center justify-between"><p className="text-sm text-text-muted">{meta.total} {meta.total === 1 ? 'guide' : 'guides'}</p><Link href="/bugs" className="text-xs text-lime">Clear filters</Link></div>{bugs.length ? <div className="grid gap-4 md:grid-cols-2">{bugs.map(bug => <BugCard key={bug.id} bug={bug} />)}</div> : <div className="rounded-card border border-dashed border-border py-16 text-center"><p className="font-medium">No bugs found</p><p className="mt-2 text-sm text-text-muted">Try clearing your filters or searching for something else.</p></div>}</main></div></div></PageLayout>
}
