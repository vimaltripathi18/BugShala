export type SourceType = 'stack_exchange' | 'github' | 'official_docs' | 'other'

export interface NormalizedDiscovery {
  sourceExternalId: string
  sourceUrl?: string
  fingerprint: string
  title: string
  content: string
  technologySlug?: string
  categorySlug?: string
  metadata?: Record<string, unknown>
}

export interface SourceAdapterContext {
  keyword: string
  technologySlug?: string
  cursor?: string
  since?: string
  baseUrl?: string
}

export interface SourceAdapterPage {
  records: NormalizedDiscovery[]
  nextCursor?: string
  rateLimitRemaining?: number
  rateLimitResetAt?: string
}

export interface SourceAdapter {
  readonly type: SourceType
  collect(context: SourceAdapterContext): Promise<SourceAdapterPage>
}
