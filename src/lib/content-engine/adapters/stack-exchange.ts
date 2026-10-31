import { contentEngineEnv } from '../env'
import { createDiscoveryFingerprint } from '../fingerprint'
import type { SourceAdapter, SourceAdapterContext, SourceAdapterPage } from '../types'

interface StackQuestion { question_id: number; title: string; link: string; body?: string; tags?: string[]; score?: number; view_count?: number; is_answered?: boolean }

export class StackExchangeAdapter implements SourceAdapter {
  readonly type = 'stack_exchange' as const
  async collect(context: SourceAdapterContext): Promise<SourceAdapterPage> {
    const page = context.cursor ? Number(context.cursor) : 1
    const params = new URLSearchParams({ site: 'stackoverflow', pagesize: '100', page: String(page), order: 'desc', sort: 'activity', intitle: context.keyword, filter: 'withbody' })
    const apiKey = contentEngineEnv.stackExchangeApiKey()
    if (apiKey) params.set('key', apiKey)
    const response = await fetch(`https://api.stackexchange.com/2.3/questions?${params}`)
    if (!response.ok) throw new Error(`Stack Exchange returned ${response.status}`)
    const payload = await response.json() as { items: StackQuestion[]; has_more: boolean }
    return {
      records: payload.items.map(question => ({
        sourceExternalId: String(question.question_id), sourceUrl: question.link,
        fingerprint: createDiscoveryFingerprint(`${question.title} ${question.tags?.join(' ') ?? ''}`),
        title: question.title, content: question.body ?? '', technologySlug: context.technologySlug,
        metadata: { tags: question.tags ?? [], score: question.score ?? 0, viewCount: question.view_count ?? 0, isAnswered: question.is_answered ?? false },
      })),
      nextCursor: payload.has_more ? String(page + 1) : undefined,
    }
  }
}
