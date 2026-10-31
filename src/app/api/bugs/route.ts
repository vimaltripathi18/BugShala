import { NextResponse } from 'next/server'
import { getBugs } from '@/lib/database/bugs'
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const result = await getBugs({ page: Number(searchParams.get('page')) || 1, sort: searchParams.get('sort') ?? undefined }); return NextResponse.json(result) }
