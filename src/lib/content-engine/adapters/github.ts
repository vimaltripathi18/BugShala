import { contentEngineEnv } from '../env'
import { createDiscoveryFingerprint } from '../fingerprint'
import type { SourceAdapter, SourceAdapterContext, SourceAdapterPage } from '../types'

interface GitHubIssue { id: number; html_url: string; title: string; body?: string | null; state: string; labels: Array<{ name?: string } | string> }

export class GitHubAdapter implements SourceAdapter {
  readonly type = 'github' as const
  async collect(context: SourceAdapterContext): Promise<SourceAdapterPage> {
    const page = context.cursor ? Number(context.cursor) : 1
    const params = new URLSearchParams({ q: `${context.keyword} is:issue`, per_page: '100', page: String(page) })
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    const token = contentEngineEnv.githubToken()
    if (token) headers.Authorization = `Bearer ${token}`
    const response = await fetch(`https://api.github.com/search/issues?${params}`, { headers })
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
    const payload = await response.json() as { items: GitHubIssue[]; total_count: number }
    return {
      records: payload.items.map(issue => ({
        sourceExternalId: String(issue.id), sourceUrl: issue.html_url,
        fingerprint: createDiscoveryFingerprint(`${issue.title} ${issue.labels.map(label => typeof label === 'string' ? label : label.name ?? '').join(' ')}`),
        title: issue.title, content: issue.body ?? '', technologySlug: context.technologySlug,
        metadata: { state: issue.state, labels: issue.labels },
      })),
      nextCursor: page * 100 < payload.total_count && page < 10 ? String(page + 1) : undefined,
      rateLimitRemaining: Number(response.headers.get('x-ratelimit-remaining')) || undefined,
      rateLimitResetAt: response.headers.get('x-ratelimit-reset') || undefined,
    }
  }
}
