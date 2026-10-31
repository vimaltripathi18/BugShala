'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { ArenaChallenge } from '@/lib/arena'

export default function ArenaChallenge({ challenge }: { challenge: ArenaChallenge }) {
  const [code, setCode] = useState(challenge.starter_code)
  const [visibleHints, setVisibleHints] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [solved, setSolved] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-wider text-text-muted">Starter code</label>
        <textarea value={code} onChange={event => setCode(event.target.value)} spellCheck={false} className="min-h-[340px] w-full resize-y overflow-auto rounded-card border border-border bg-[#101116] p-4 font-mono text-sm outline-none focus:border-lime" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-md border border-border px-3 py-2 text-sm hover:border-lime" onClick={() => setCode(challenge.starter_code)}><RotateCcw size={14} className="mr-2 inline" />Reset</button>
          <button className="rounded-md border border-border px-3 py-2 text-sm hover:border-lime" onClick={() => setShowSolution(true)}>Request solution</button>
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-card border border-border bg-bg-surface p-4">
          <h2 className="text-sm font-medium">Output</h2>
          <p className="mt-3 text-sm text-yellow-200">Secure execution is not configured. Connect a sandboxed Judge0 service before running submissions.</p>
          <button className="mt-4 w-full rounded-md border border-border px-3 py-2 text-sm text-text-muted" disabled>Run submission</button>
        </div>
        <div className="rounded-card border border-border bg-bg-surface p-4">
          <h2 className="text-sm font-medium">Hints</h2>
          {challenge.hints?.slice(0, visibleHints).map(hint => <p key={hint.sequence} className="mt-3 text-sm text-text-secondary">{hint.sequence}. {hint.hint}</p>)}
          <button className="mt-4 text-sm text-lime disabled:text-text-muted" disabled={visibleHints >= (challenge.hints?.length ?? 0)} onClick={() => setVisibleHints(value => value + 1)}>Reveal next hint</button>
        </div>
      </aside>
      {(showSolution || solved) && (
        <section className="rounded-card border border-border bg-bg-surface p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold">Solution explanation</h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">{challenge.explanation}</p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-[#101116] p-4 text-sm"><code>{challenge.solution_code}</code></pre>
        </section>
      )}
    </div>
  )
}
