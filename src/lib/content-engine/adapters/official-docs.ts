import { createDiscoveryFingerprint } from '../fingerprint'
import type { SourceAdapter, SourceAdapterContext, SourceAdapterPage } from '../types'

function extractTag(html: string, expression: RegExp): string | undefined {
  const match = html.match(expression)
  return match?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export class OfficialDocsAdapter implements SourceAdapter {
  readonly type = 'official_docs' as const

  async collect(context: SourceAdapterContext): Promise<SourceAdapterPage> {
    if (!context.baseUrl) return { records: [] }
    const response = await fetch(context.baseUrl, { headers: { Accept: 'text/html' } })
    if (!response.ok) throw new Error(`Official documentation returned ${response.status}`)
    const html = await response.text()
    const title = extractTag(html, /<title[^>]*>([^<]+)<\/title>/i)
      ?? extractTag(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
    if (!title) return { records: [] }

    return {
      records: [{
        sourceExternalId: context.baseUrl,
        sourceUrl: context.baseUrl,
        fingerprint: createDiscoveryFingerprint(`${title} ${context.baseUrl}`),
        title,
        content: html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ''),
        technologySlug: context.technologySlug,
      }],
    }
  }
}
