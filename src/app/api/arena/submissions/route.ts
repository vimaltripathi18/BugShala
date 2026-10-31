import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let sourceCode: string | undefined
  try {
    const body = await request.json()
    sourceCode = typeof body.sourceCode === 'string' ? body.sourceCode : undefined
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request.' }, { status: 400 })
  }

  if (!sourceCode) return NextResponse.json({ error: 'Source code is required.' }, { status: 400 })
  if (sourceCode.length > 100_000) return NextResponse.json({ error: 'Submission exceeds the 100 KB limit.' }, { status: 413 })
  if (!process.env.JUDGE0_URL || !process.env.JUDGE0_API_KEY) {
    return NextResponse.json({ error: 'Secure challenge execution is not configured.' }, { status: 503 })
  }

  return NextResponse.json({ error: 'Submission endpoint is ready, but Judge0 integration must be completed before submissions are executed.' }, { status: 503 })
}
