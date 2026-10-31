import { supabase } from './supabase'
import { seedBugs, seedTechnologies, seedCategories } from '../seed-data'
import type { Bug, BugListItem, PaginationMeta, Technology, Category } from '@/types'

const PER_PAGE = 20

export interface BugsQueryResult {
  bugs: BugListItem[]
  meta: PaginationMeta
}

export async function getBugs(params: {
  q?: string
  technology?: string[]
  category?: string[]
  difficulty?: string[]
  sort?: string
  page?: number
}): Promise<BugsQueryResult> {
  const { q, technology, category, difficulty, sort = 'recently_added', page = 1 } = params

  // Use seed data if no Supabase configured
  if (!supabase) {
    return getBugsFromSeed({ q, technology, category, difficulty, sort, page })
  }

  try {
    let query = supabase
      .from('bugs')
      .select(`
        id, title, slug, short_description, difficulty, verification_status,
        estimated_reading_time, helpful_count, published_at, updated_at,
        technology:technologies(name, slug, icon, color),
        category:categories(name, slug)
      `, { count: 'exact' })
      .eq('is_published', true)

    if (q) {
      const escaped = q.trim().replace(/[,%()]/g, '\\$&')
      if (escaped) {
        query = query.or(`title.ilike.%${escaped}%,exact_error.ilike.%${escaped}%,short_description.ilike.%${escaped}%`)
      }
    }

    if (technology?.length) {
      const { data: techs } = await supabase
        .from('technologies')
        .select('id')
        .in('slug', technology)
      if (techs?.length) {
        query = query.in('technology_id', techs.map((t) => t.id))
      } else {
        return {
          bugs: [],
          meta: { page, per_page: PER_PAGE, total: 0, total_pages: 0 },
        }
      }
    }

    if (category?.length) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .in('slug', category)
      if (categories?.length) {
        query = query.in('category_id', categories.map((c) => c.id))
      } else {
        return {
          bugs: [],
          meta: { page, per_page: PER_PAGE, total: 0, total_pages: 0 },
        }
      }
    }

    if (difficulty?.length) {
      query = query.in('difficulty', difficulty)
    }

    switch (sort) {
      case 'recently_updated':
        query = query.order('updated_at', { ascending: false })
        break
      case 'most_helpful':
        query = query.order('helpful_count', { ascending: false })
        break
      default:
        query = query.order('published_at', { ascending: false })
    }

    const from = (page - 1) * PER_PAGE
    query = query.range(from, from + PER_PAGE - 1)

    const { data, count, error } = await query
    if (error) throw error
    if (!data?.length && !q && !technology?.length && !category?.length && !difficulty?.length) {
      return getBugsFromSeed({ q, technology, category, difficulty, sort, page })
    }

    return {
      bugs: (data ?? []) as unknown as BugListItem[],
      meta: {
        page,
        per_page: PER_PAGE,
        total: count ?? 0,
        total_pages: Math.ceil((count ?? 0) / PER_PAGE),
      },
    }
  } catch {
    return getBugsFromSeed({ q, technology, category, difficulty, sort, page })
  }
}

export async function getBugBySlug(technology: string, slug: string): Promise<Bug | null> {
  if (!supabase) {
    return getBugFromSeed(technology, slug)
  }

  try {
    const { data, error } = await supabase
      .from('bugs')
      .select(`
        *,
        technology:technologies(*),
        category:categories(*),
        references:bug_references(*),
        tags:bug_tags(tag)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return data as unknown as Bug
  } catch {
    return getBugFromSeed(technology, slug)
  }
}

export async function getTechnologies(): Promise<Technology[]> {
  if (!supabase) return seedTechnologies

  try {
    const { data, error } = await supabase
      .from('technologies')
      .select('*, bug_count:bugs(count)')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data?.length ? data as unknown as Technology[] : seedTechnologies
  } catch {
    return seedTechnologies
  }
}

export async function getTechnologyBySlug(slug: string): Promise<Technology | null> {
  if (!supabase) {
    return seedTechnologies.find(t => t.slug === slug) ?? null
  }

  try {
    const { data, error } = await supabase
      .from('technologies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Technology
  } catch {
    return seedTechnologies.find(t => t.slug === slug) ?? null
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!supabase) return seedCategories

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data?.length ? data as Category[] : seedCategories
  } catch {
    return seedCategories
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!supabase) {
    return seedCategories.find(c => c.slug === slug) ?? null
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Category
  } catch {
    return seedCategories.find(c => c.slug === slug) ?? null
  }
}

export async function getRelatedBugs(bugId: string, technologyId: string, limit = 5): Promise<BugListItem[]> {
  if (!supabase) {
    const related = seedBugs
      .filter(b => b.id !== bugId && b.technology_id === technologyId && b.is_published)
      .slice(0, limit)
    return related.map(formatSeedBug)
  }

  try {
    const { data, error } = await supabase
      .from('bugs')
      .select(`
        id, title, slug, short_description, difficulty, verification_status,
        estimated_reading_time, helpful_count, published_at, updated_at,
        technology:technologies(name, slug, icon, color),
        category:categories(name, slug)
      `)
      .eq('technology_id', technologyId)
      .neq('id', bugId)
      .eq('is_published', true)
      .order('helpful_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data ?? []) as unknown as BugListItem[]
  } catch {
    return seedBugs
      .filter(b => b.id !== bugId && b.technology_id === technologyId && b.is_published)
      .slice(0, limit)
      .map(formatSeedBug)
  }
}

export async function searchSuggestions(q: string) {
  const bugs = seedBugs
    .filter(b =>
      b.is_published &&
      (b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.short_description.toLowerCase().includes(q.toLowerCase()))
    )
    .slice(0, 6)

  const techs = seedTechnologies
    .filter(t => t.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 2)

  const cats = seedCategories
    .filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 2)

  return [
    ...bugs.map(b => {
      const tech = seedTechnologies.find(t => t.id === b.technology_id)
      return {
        type: 'bug' as const,
        id: b.id,
        title: b.title,
        subtitle: tech?.name,
        href: `/bugs/${tech?.slug ?? 'general'}/${b.slug}`,
      }
    }),
    ...techs.map(t => ({
      type: 'technology' as const,
      id: t.id,
      title: t.name,
      subtitle: 'Technology',
      href: `/technology/${t.slug}`,
    })),
    ...cats.map(c => ({
      type: 'category' as const,
      id: c.id,
      title: c.name,
      subtitle: 'Category',
      href: `/category/${c.slug}`,
    })),
  ]
}

// Seed data helpers
function getBugsFromSeed(params: {
  q?: string
  technology?: string[]
  category?: string[]
  difficulty?: string[]
  sort?: string
  page?: number
}): BugsQueryResult {
  const { q, technology, category, difficulty, sort = 'recently_added', page = 1 } = params
  let filtered = seedBugs.filter(b => b.is_published)

  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      b =>
        b.title.toLowerCase().includes(lower) ||
        b.short_description.toLowerCase().includes(lower)
    )
  }

  if (technology?.length) {
    const techIds = seedTechnologies
      .filter(t => technology.includes(t.slug))
      .map(t => t.id)
    filtered = filtered.filter(b => techIds.includes(b.technology_id))
  }

  if (category?.length) {
    const catIds = seedCategories
      .filter(c => category.includes(c.slug))
      .map(c => c.id)
    filtered = filtered.filter(b => catIds.includes(b.category_id))
  }

  if (difficulty?.length) {
    filtered = filtered.filter(b => difficulty.includes(b.difficulty))
  }

  switch (sort) {
    case 'recently_updated':
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      break
    case 'most_helpful':
      filtered.sort((a, b) => b.helpful_count - a.helpful_count)
      break
    default:
      filtered.sort((a, b) => new Date(b.published_at ?? '').getTime() - new Date(a.published_at ?? '').getTime())
  }

  const total = filtered.length
  const from = (page - 1) * PER_PAGE
  const paged = filtered.slice(from, from + PER_PAGE)

  return {
    bugs: paged.map(formatSeedBug),
    meta: {
      page,
      per_page: PER_PAGE,
      total,
      total_pages: Math.ceil(total / PER_PAGE),
    },
  }
}

function getBugFromSeed(technology: string, slug: string): Bug | null {
  const bug = seedBugs.find(b => b.slug === slug && b.is_published)
  if (!bug) return null

  const tech = seedTechnologies.find(t => t.id === bug.technology_id)
  const cat = seedCategories.find(c => c.id === bug.category_id)

  return {
    ...bug,
    technology: tech,
    category: cat,
    references: bug.references ?? [],
    tags: [],
  } as Bug
}

function formatSeedBug(b: typeof seedBugs[0]): BugListItem {
  const tech = seedTechnologies.find(t => t.id === b.technology_id)
  const cat = seedCategories.find(c => c.id === b.category_id)
  return {
    id: b.id,
    title: b.title,
    slug: b.slug,
    short_description: b.short_description,
    difficulty: b.difficulty,
    verification_status: b.verification_status,
    estimated_reading_time: b.estimated_reading_time,
    helpful_count: b.helpful_count,
    published_at: b.published_at,
    updated_at: b.updated_at,
    technology: {
      name: tech?.name ?? '',
      slug: tech?.slug ?? '',
      icon: tech?.icon ?? '',
      color: tech?.color ?? '#747986',
    },
    category: {
      name: cat?.name ?? '',
      slug: cat?.slug ?? '',
    },
  }
}
