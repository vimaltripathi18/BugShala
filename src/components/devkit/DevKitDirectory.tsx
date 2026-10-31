'use client'

import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { devTools } from '@/lib/devkit'

export default function DevKitDirectory() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const categories = [...new Set(devTools.map(tool => tool.category))]
  const visible = useMemo(() => devTools.filter(tool => {
    const matchesCategory = !category || tool.category === category
    const matchesQuery = !query || `${tool.name} ${tool.description} ${tool.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [category, query])

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-text-muted" /><input aria-label="Search DevKit tools" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tools…" className="w-full rounded-md border border-border bg-bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-lime" /></label>
        <select aria-label="Filter tool category" value={category} onChange={event => setCategory(event.target.value)} className="rounded-md border border-border bg-bg-surface px-3 py-2 text-sm outline-none focus:border-lime"><option value="">All categories</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      {visible.length ? <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map(tool => { const Icon = tool.icon; return <Link key={tool.slug} href={`/devkit/${tool.slug}`} className="group rounded-card border border-border bg-bg-surface p-5 transition hover:border-lime"><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated text-lime"><Icon size={18} /></span><ArrowRight size={16} className="text-text-muted transition group-hover:text-lime" /></div><h2 className="mt-5 font-medium">{tool.name}</h2><p className="mt-2 text-sm text-text-secondary">{tool.description}</p><p className="mt-4 text-xs text-text-muted">{tool.category}</p></Link> })}</div> : <div className="mt-10 rounded-card border border-dashed border-border py-14 text-center"><p className="font-medium">No matching tools</p><p className="mt-2 text-sm text-text-muted">Try another name or category.</p></div>}
    </>
  )
}
