import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/database/supabase'

export async function POST(request: NextRequest) {
  let sourceCode: string | undefined
  let slug: string | undefined
  let language: string | undefined
  try {
    const declaredLength = Number(request.headers.get('content-length') ?? 0)
    if (declaredLength > 120_000) {
      return NextResponse.json({ error: 'Submission payload exceeds the 100 KB limit.' }, { status: 413 })
    }
    const rawBody = await request.text()
    if (rawBody.length > 120_000) {
      return NextResponse.json({ error: 'Submission payload exceeds the 100 KB limit.' }, { status: 413 })
    }
    const body = JSON.parse(rawBody)
    sourceCode = typeof body.sourceCode === 'string' ? body.sourceCode : undefined
    slug = typeof body.slug === 'string' ? body.slug.slice(0, 120) : undefined
    language = typeof body.language === 'string' ? body.language : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 })
  }

  if (!sourceCode) return NextResponse.json({ error: 'Source code is required.' }, { status: 400 })
  if (!slug) return NextResponse.json({ error: 'Challenge is required.' }, { status: 400 })
  if (sourceCode.length > 100_000) return NextResponse.json({ error: 'Submission exceeds the 100 KB limit.' }, { status: 413 })
  const allowedLanguages = new Set(['javascript', 'typescript', 'python', 'java', 'cpp', 'sql', 'html', 'css'])
  if (!language || !allowedLanguages.has(language)) return NextResponse.json({ error: 'Unsupported challenge language.' }, { status: 400 })
  const supabaseAdmin = getServiceClient()
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Submission validation is temporarily unavailable.' }, { status: 503 })
  }
  const { data: challenge } = await supabaseAdmin
    .from('arena_challenges')
    .select('language')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (!challenge) return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 })
  if (challenge.language !== language) return NextResponse.json({ error: 'The selected language does not match this challenge.' }, { status: 400 })
  if (!process.env.JUDGE0_URL || !process.env.JUDGE0_API_KEY) {
    return NextResponse.json({ error: 'Secure challenge execution is not configured.' }, { status: 503 })
  }

  return NextResponse.json({ error: 'Submission endpoint is ready, but Judge0 integration must be completed before submissions are executed.' }, { status: 503 })
}
