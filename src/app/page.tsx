import Link from 'next/link'
import { ArrowRight, Bug, Search, ShieldCheck } from 'lucide-react'
import PageLayout from '@/components/layout/PageLayout'
import { getBugs, getTechnologies, getCategories } from '@/lib/database/bugs'
import DifficultyBadge from '@/components/ui/DifficultyBadge'

export const instant = false

export default async function Home() {
  const [{ bugs }, technologies, categories] = await Promise.all([
    getBugs({ sort: 'recently_added', page: 1 }), getTechnologies(), getCategories(),
  ])

  return (
    <PageLayout>
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-24 text-center">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-bg-surface px-3 py-1 text-xs text-text-secondary"><ShieldCheck size={13} className="text-lime" /> Verified, practical debugging guides</div>
        <h1 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Every bug has a <span className="text-lime">lesson.</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">Understand errors, find reliable fixes, and build the debugging intuition to solve the next one yourself.</p>
        <form action="/search" method="get" className="mx-auto mt-8 flex max-w-2xl items-center rounded-xl border border-border bg-bg-surface p-2">
          <Search size={18} className="ml-2 shrink-0 text-text-muted" />
          <input
            type="search"
            name="q"
            aria-label="Search for a bug or error"
            placeholder="Search an error or bug…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-sm text-text-primary outline-none ring-0 [box-shadow:none] focus-visible:outline-none focus-visible:ring-0 focus-visible:[box-shadow:none] placeholder:text-text-muted"
          />
          <button type="submit" className="flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-medium text-lime-text">
            Explore <ArrowRight size={15} />
          </button>
        </form>
      </section>
      <section className="border-y border-border bg-bg-sidebar py-14"><div className="mx-auto max-w-7xl px-6"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-lime">Browse</p><h2 className="mt-1 text-2xl font-semibold">Popular technologies</h2></div><Link href="/bugs" className="text-sm text-text-secondary hover:text-lime">View library →</Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{technologies.map((technology) => <Link key={technology.id} href={`/technology/${technology.slug}`} className="rounded-card border border-border bg-bg-surface p-5 transition hover:-translate-y-0.5 hover:border-[#4A5060]"><span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated font-mono text-sm" style={{ color: technology.color }}>{technology.name.slice(0, 2)}</span><h3 className="font-medium">{technology.name}</h3><p className="mt-1 line-clamp-2 text-xs text-text-muted">{technology.description}</p></Link>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-6 py-16"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-lime">Fresh fixes</p><h2 className="mt-1 text-2xl font-semibold">Recently added bugs</h2></div><Link href="/bugs" className="text-sm text-text-secondary hover:text-lime">Browse all →</Link></div><div className="grid gap-4 lg:grid-cols-3">{bugs.slice(0, 6).map((bug) => <Link key={bug.id} href={`/bugs/${bug.technology.slug}/${bug.slug}`} className="group rounded-card border border-border bg-bg-surface p-5 transition hover:border-[#4A5060]"><div className="mb-4 flex items-center justify-between"><span className="text-xs text-text-muted">{bug.technology.name}</span><DifficultyBadge difficulty={bug.difficulty} /></div><h3 className="font-medium leading-snug group-hover:text-lime">{bug.title}</h3><p className="mt-2 line-clamp-2 text-sm text-text-secondary">{bug.short_description}</p><div className="mt-5 flex items-center justify-between text-xs text-text-muted"><span>{bug.category.slug.replaceAll('-', ' ')}</span><span>{bug.estimated_reading_time} min read</span></div></Link>)}</div></section>
      <section className="mx-auto max-w-7xl px-6 pb-20"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{categories.map((category) => <Link key={category.id} href={`/category/${category.slug}`} className="rounded-card border border-border px-4 py-5 text-sm font-medium hover:border-lime"><Bug size={16} className="mb-3 text-lime" />{category.name}</Link>)}</div></section>
    </PageLayout>
  )
}
