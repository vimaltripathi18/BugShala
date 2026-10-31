import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { BugListItem } from '@/types'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import VerificationBadge from '@/components/ui/VerificationBadge'

export default function BugCard({ bug }: { bug: BugListItem }) {
  return (
    <Link href={`/bugs/${bug.technology.slug}/${bug.slug}`} className="group block rounded-card border border-border bg-bg-surface p-5 transition hover:-translate-y-0.5 hover:border-[#4A5060]">
      <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-medium" style={{ color: bug.technology.color }}>{bug.technology.name}</span><DifficultyBadge difficulty={bug.difficulty} /></div>
      <h2 className="font-medium leading-snug group-hover:text-lime">{bug.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{bug.short_description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2"><VerificationBadge status={bug.verification_status} /><span className="ml-auto flex items-center gap-1 text-xs text-text-muted"><Clock size={12} />{bug.estimated_reading_time} min</span></div>
    </Link>
  )
}
