'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ArenaChallenge } from '@/lib/arena'

export default function ArenaDirectory({ challenges }: { challenges: ArenaChallenge[] }) {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [technology, setTechnology] = useState('')
  const technologies = useMemo(() => Array.from(new Set(challenges.map(challenge => challenge.technology?.name).filter((name): name is string => Boolean(name)))), [challenges])
  const visible = useMemo(() => challenges.filter(challenge => {
    const searchable = `${challenge.title} ${challenge.description} ${challenge.problem_statement} ${challenge.technology?.name ?? ''} ${challenge.category?.name ?? ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query.toLowerCase())
    return matchesQuery && (!difficulty || challenge.difficulty === difficulty) && (!technology || challenge.technology?.name === technology)
  }), [challenges, difficulty, query, technology])

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-text-muted" /><input aria-label="Search challenges" placeholder="Search challenges…" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-md border border-border bg-bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-lime" /></label>
        <select aria-label="Filter by difficulty" value={difficulty} onChange={event => setDifficulty(event.target.value)} className="rounded-md border border-border bg-bg-surface px-3 py-2 text-sm outline-none focus:border-lime"><option value="">All difficulties</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="expert">Expert</option></select>
        <select aria-label="Filter by technology" value={technology} onChange={event => setTechnology(event.target.value)} className="rounded-md border border-border bg-bg-surface px-3 py-2 text-sm outline-none focus:border-lime"><option value="">All technologies</option>{technologies.map(name => <option key={name} value={name}>{name}</option>)}</select>
      </div>
      {visible.length ? <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map(challenge => <Link key={challenge.id} href={`/arena/challenges/${challenge.slug}`} className="rounded-card border border-border bg-bg-surface p-5 transition hover:border-lime"><div className="flex items-center justify-between gap-3"><span className="text-xs capitalize text-lime">{challenge.difficulty}</span>{challenge.estimated_minutes && <span className="text-xs text-text-muted">{challenge.estimated_minutes} min</span>}</div><h2 className="mt-4 font-medium">{challenge.title}</h2><p className="mt-2 line-clamp-2 text-sm text-text-secondary">{challenge.description}</p><p className="mt-4 text-xs text-text-muted">{challenge.technology?.name ?? 'General'} · {challenge.category?.name ?? 'Debugging'}</p></Link>)}</div> : <div className="mt-10 rounded-card border border-dashed border-border py-14 text-center"><p className="font-medium">No matching challenges</p><p className="mt-2 text-sm text-text-muted">Try another search or difficulty.</p></div>}
      <p className="mt-8 text-xs text-text-muted">{visible.length} challenge{visible.length === 1 ? '' : 's'}</p>
    </>
  )
}
