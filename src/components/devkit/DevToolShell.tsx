'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { devTools } from '@/lib/devkit'

export default function DevToolShell({ slug, children }: { slug: string; children: ReactNode }) {
  const tool = devTools.find(item => item.slug === slug)
  if (!tool) return null

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <Link href="/devkit" className="text-xs text-lime hover:underline">← All DevKit tools</Link>
        <p className="mt-5 text-xs uppercase tracking-widest text-text-muted">{tool.category}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{tool.name}</h1>
        <p className="mt-3 text-text-secondary">{tool.description}</p>
      </div>
      {children}
    </div>
  )
}
