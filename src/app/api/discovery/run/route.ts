import { NextResponse } from 'next/server'
import { StackExchangeAdapter } from '@/lib/content-engine/adapters/stack-exchange'
import { GitHubAdapter } from '@/lib/content-engine/adapters/github'
import { OfficialDocsAdapter } from '@/lib/content-engine/adapters/official-docs'
import { getServiceClient } from '@/lib/database/supabase'
import { inferCategory, inferTechnology, scoreRelevance, scoreSourceQuality, similarity } from '@/lib/content-engine/intelligence'

const DEFAULT_KEYWORDS = ['javascript error', 'typescript error', 'react error', 'next.js error']

function authorised(request: Request): boolean {
  const secret = process.env.CONTENT_ENGINE_CRON_SECRET
  const header = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(secret && header && header === secret)
}

export async function POST(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = getServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Content engine database is not configured' }, { status: 503 })

  const body = await request.json().catch(() => ({})) as { keywords?: string[]; sources?: Array<'stack_exchange' | 'github' | 'official_docs'> }
  const { data: registryKeywords } = await supabase
    .from('discovery_keywords')
    .select('keyword, technology_slug, priority')
    .eq('enabled', true)
    .order('priority', { ascending: false })
    .limit(20)
  const registeredKeywords = registryKeywords?.map(item => item.keyword) ?? []
  const keywords = body.keywords?.length ? body.keywords.slice(0, 20) : registeredKeywords.length ? registeredKeywords : DEFAULT_KEYWORDS
  const sources = body.sources?.length ? body.sources : ['stack_exchange', 'github'] as Array<'stack_exchange' | 'github' | 'official_docs'>
  const adapters = { stack_exchange: new StackExchangeAdapter(), github: new GitHubAdapter(), official_docs: new OfficialDocsAdapter() }
  let inserted = 0
  let duplicate = 0
  let similar = 0
  const { data: existingRecords } = await supabase
    .from('discovery_records')
    .select('fingerprint, title, raw_content')
    .order('created_at', { ascending: false })
    .limit(1000)
  const knownRecords = (existingRecords ?? []).map(item => ({
    sourceExternalId: '', fingerprint: item.fingerprint, title: item.title, content: item.raw_content ?? '',
  }))

  for (const sourceType of sources) {
    const { data: source, error: sourceError } = await supabase.from('source_registry').select('id, base_url').eq('type', sourceType).eq('enabled', true).limit(1).maybeSingle()
    if (sourceError) throw sourceError
    if (!source) continue
    const adapter = adapters[sourceType]
    for (const keyword of keywords) {
      const keywordTechnology = registryKeywords?.find(item => item.keyword === keyword)?.technology_slug ?? inferTechnology(keyword)
      let cursor: string | undefined
      let pageCount = 0
      do {
        const page = await adapter.collect({ keyword, cursor, baseUrl: source.base_url ?? undefined })
        for (const record of page.records) {
          if (knownRecords.some(existing => existing.fingerprint === record.fingerprint)) {
            duplicate++
            continue
          }
          if (knownRecords.some(existing => similarity(record, existing) >= 0.82)) {
            similar++
            continue
          }
          const text = `${record.title} ${record.content}`
          const technologySlug = keywordTechnology ?? inferTechnology(text)
          const categorySlug = inferCategory(text)
          const relevanceScore = scoreRelevance(record, keyword)
          if (relevanceScore < 20) continue
          const { error } = await supabase.from('discovery_records').insert({
            source_id: source.id, source_external_id: record.sourceExternalId, source_url: record.sourceUrl,
            fingerprint: record.fingerprint, title: record.title, raw_content: record.content,
            technology_slug: technologySlug ?? record.technologySlug, category_slug: categorySlug ?? record.categorySlug,
            source_metadata: record.metadata ?? {}, relevance_score: relevanceScore,
            source_quality_score: scoreSourceQuality(sourceType),
          })
          if (error?.code === '23505') duplicate++
          else if (!error) {
            inserted++
            knownRecords.push(record)
          } else throw new Error(`Discovery insert failed: ${error.message}`)
        }
        cursor = page.nextCursor
        pageCount++
      } while (cursor && pageCount < 5)
    }
  }

  return NextResponse.json({ inserted, duplicate, similar, keywords, sources })
}
