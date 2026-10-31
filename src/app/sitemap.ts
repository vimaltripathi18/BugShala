import type { MetadataRoute } from 'next'
import { getBugs, getTechnologies, getCategories } from '@/lib/database/bugs'
import { getArenaChallenges } from '@/lib/arena'
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bugshala.com'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ bugs }, technologies, categories, arenaChallenges] = await Promise.all([
    getBugs({}), getTechnologies(), getCategories(), getArenaChallenges(),
  ])
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/bugs`, lastModified: new Date() },
    { url: `${baseUrl}/arena`, lastModified: new Date() },
    { url: `${baseUrl}/arena/challenges`, lastModified: new Date() },
    ...technologies.map(t => ({ url: `${baseUrl}/technology/${t.slug}`, lastModified: new Date() })),
    ...categories.map(c => ({ url: `${baseUrl}/category/${c.slug}`, lastModified: new Date() })),
    ...arenaChallenges.map(challenge => ({ url: `${baseUrl}/arena/challenges/${challenge.slug}`, lastModified: new Date() })),
    ...bugs.map(b => ({ url: `${baseUrl}/bugs/${b.technology.slug}/${b.slug}`, lastModified: b.updated_at ? new Date(b.updated_at) : new Date() })),
  ]
}
