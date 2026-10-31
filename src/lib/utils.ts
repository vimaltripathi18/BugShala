import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Difficulty, VerificationStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function difficultyLabel(difficulty: Difficulty): string {
  const labels: Record<Difficulty, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }
  return labels[difficulty] ?? difficulty
}

export function difficultyColor(difficulty: Difficulty): string {
  const colors: Record<Difficulty, string> = {
    beginner: '#48C78E',
    intermediate: '#E6B85C',
    advanced: '#F07178',
  }
  return colors[difficulty] ?? '#747986'
}

export function verificationLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    editor_reviewed: 'Editor Reviewed',
    documentation_verified: 'Docs Verified',
    community_tested: 'Community Tested',
    not_reviewed: 'Not Reviewed',
  }
  return labels[status] ?? status
}

export function verificationColor(status: VerificationStatus): string {
  const colors: Record<VerificationStatus, string> = {
    editor_reviewed: '#48C78E',
    documentation_verified: '#79A9F5',
    community_tested: '#E6B85C',
    not_reviewed: '#747986',
  }
  return colors[status] ?? '#747986'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function estimateReadTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

export function generateSessionHash(): string {
  if (typeof window === 'undefined') return ''
  const existing = sessionStorage.getItem('bs_session')
  if (existing) return existing
  const hash = Math.random().toString(36).substring(2) + Date.now().toString(36)
  sessionStorage.setItem('bs_session', hash)
  return hash
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '…'
}

export function buildSearchUrl(params: {
  q?: string
  technology?: string[]
  category?: string[]
  difficulty?: string[]
  page?: number
  sort?: string
}): string {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.technology?.length) searchParams.set('technology', params.technology.join(','))
  if (params.category?.length) searchParams.set('category', params.category.join(','))
  if (params.difficulty?.length) searchParams.set('difficulty', params.difficulty.join(','))
  if (params.page && params.page > 1) searchParams.set('page', String(params.page))
  if (params.sort && params.sort !== 'relevance') searchParams.set('sort', params.sort)
  const qs = searchParams.toString()
  return qs ? `/search?${qs}` : '/search'
}
