import type { Metadata } from 'next'
import type { Bug, Technology, Category } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bugshala.com'

export function getBugMetadata(bug: Bug): Metadata {
  const title = `${bug.title} — How to Fix | BugShala`
  const description = bug.short_description

  return {
    title,
    description,
    keywords: [
      bug.title,
      bug.technology?.name ?? '',
      bug.category?.name ?? '',
      'fix',
      'solution',
      'error',
      'debugging',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/bugs/${bug.technology?.slug}/${bug.slug}`,
      type: 'article',
      publishedTime: bug.published_at ?? undefined,
      modifiedTime: bug.updated_at,
    },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `${BASE_URL}/bugs/${bug.technology?.slug}/${bug.slug}` },
  }
}

export function getTechnologyMetadata(technology: Technology): Metadata {
  const title = `${technology.name} Errors & Fixes | BugShala`
  const description = technology.description

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/technology/${technology.slug}` },
    alternates: { canonical: `${BASE_URL}/technology/${technology.slug}` },
  }
}

export function getCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} — Debugging Guide | BugShala`
  const description = category.description

  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE_URL}/category/${category.slug}` },
    alternates: { canonical: `${BASE_URL}/category/${category.slug}` },
  }
}
