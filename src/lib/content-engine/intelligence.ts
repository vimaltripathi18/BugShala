import type { NormalizedDiscovery, SourceType } from './types'

const TECHNOLOGIES = ['javascript', 'typescript', 'react', 'nextjs', 'nodejs']
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'runtime-errors': ['error', 'exception', 'undefined', 'cannot read', 'crash'],
  'build-compile': ['build', 'compile', 'module not found', 'typescript', 'dependency'],
  'network-api': ['cors', 'http', 'fetch', 'api', 'network'],
  'state-hooks': ['state', 'hook', 'effect', 'react'],
  environment: ['environment', 'install', 'npm', 'port', 'node'],
}

const SOURCE_QUALITY: Record<SourceType, number> = {
  official_docs: 95,
  stack_exchange: 78,
  github: 72,
  other: 50,
}

function tokenSet(value: string): Set<string> {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(word => word.length > 2))
}

export function inferTechnology(text: string): string | undefined {
  const lower = text.toLowerCase()
  return TECHNOLOGIES.find(technology => lower.includes(technology === 'nodejs' ? 'node.js' : technology))
    ?? TECHNOLOGIES.find(technology => lower.includes(technology))
}

export function inferCategory(text: string): string | undefined {
  const lower = text.toLowerCase()
  let best: { slug: string; matches: number } | undefined
  for (const [slug, terms] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = terms.filter(term => lower.includes(term)).length
    if (matches && (!best || matches > best.matches)) best = { slug, matches }
  }
  return best?.slug
}

export function scoreSourceQuality(sourceType: SourceType): number {
  return SOURCE_QUALITY[sourceType]
}

export function scoreRelevance(record: NormalizedDiscovery, keyword: string): number {
  const haystack = `${record.title} ${record.content}`.toLowerCase()
  const keywordTokens = tokenSet(keyword)
  const titleMatches = [...keywordTokens].filter(token => record.title.toLowerCase().includes(token)).length
  const contentMatches = [...keywordTokens].filter(token => haystack.includes(token)).length
  const phraseMatch = keyword.length > 2 && haystack.includes(keyword.toLowerCase()) ? 25 : 0
  const tokenCoverage = keywordTokens.size ? ((titleMatches + contentMatches) / (keywordTokens.size * 2)) * 75 : 0
  return Math.min(100, Math.round(phraseMatch + tokenCoverage))
}

export function similarity(first: NormalizedDiscovery, second: NormalizedDiscovery): number {
  const a = tokenSet(`${first.title} ${first.content.slice(0, 500)}`)
  const b = tokenSet(`${second.title} ${second.content.slice(0, 500)}`)
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection++
  const union = new Set([...a, ...b]).size
  return intersection / union
}
