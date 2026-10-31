import PageLayout from '@/components/layout/PageLayout'
import BugCard from '@/components/bugs/BugCard'
export const instant = false
import { getBugs } from '@/lib/database/bugs'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams
  const { bugs, meta } = await getBugs({ q })
  return <PageLayout><div className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs uppercase tracking-widest text-lime">Search</p><h1 className="mt-2 text-4xl font-semibold">{q ? `Results for “${q}”` : 'Search BugShala'}</h1><p className="mt-3 text-text-secondary">{meta.total} guides found</p>{bugs.length ? <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{bugs.map(bug => <BugCard key={bug.id} bug={bug} />)}</div> : <div className="mt-10 rounded-card border border-dashed border-border py-16 text-center text-text-muted">Try a technology, error message, or package name.</div>}</div></PageLayout>
}
