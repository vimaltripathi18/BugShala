import { NextResponse } from 'next/server'
import { getBugs } from '@/lib/database/bugs'
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const split = (key: string) => searchParams.get(key)?.split(',').filter(Boolean); const result = await getBugs({ q: searchParams.get('q') ?? undefined, technology: split('technology'), category: split('category'), difficulty: split('difficulty'), sort: searchParams.get('sort') ?? undefined, page: Number(searchParams.get('page')) || 1 }); return NextResponse.json(result) }
