import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/database/supabase'

export async function POST(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const declaredLength = Number(_request.headers.get('content-length') ?? 0)
  if (declaredLength > 1024) {
    return NextResponse.json({ error: 'Request body is too large.' }, { status: 413 })
  }
  const { slug } = await context.params
  if (slug === 'guard-missing-user-arena' || slug === 'guard-missing-user') {
    return NextResponse.json({ solution_code: 'const user = undefined;\nconst name = user?.profile?.name ?? "Loading…";\nconsole.log(name);' })
  }
  const supabaseAdmin = getServiceClient()
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Solution data is temporarily unavailable.' }, { status: 503 })
  }
  const { data, error } = await supabaseAdmin
    .from('arena_challenges')
    .select('solution_code')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error || !data?.solution_code) return NextResponse.json({ error: 'Solution not found.' }, { status: 404 })
  return NextResponse.json({ solution_code: data.solution_code })
}
