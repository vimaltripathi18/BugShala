import { supabase } from './database/supabase'

export interface ArenaChallenge {
  id: string
  title: string
  slug: string
  description: string
  problem_statement: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  language: string
  starter_code: string
  solution_code?: string
  explanation: string
  estimated_minutes: number | null
  technology?: { name: string; slug: string } | null
  category?: { name: string; slug: string } | null
  related_bug_id?: string | null
  hints?: Array<{ sequence: number; hint: string }>
  public_tests?: Array<{ title: string; stdin: string; expected_output: string }>
  challenge_type?: string
  expected_behavior?: string
  tags?: string[]
}

export const fallbackChallenges: ArenaChallenge[] = [
  {
    id: 'arena-undefined-user',
    title: 'Guard the missing user',
    slug: 'guard-missing-user',
    description: 'A profile page crashes while the user response is still loading.',
    problem_statement: 'Fix the nested property access so the page renders a loading label until user data is available.',
    difficulty: 'beginner', language: 'javascript',
    starter_code: 'const user = undefined;\nconst name = user.profile.name;\nconsole.log(name);',
    explanation: 'Optional chaining avoids reading properties from nullish values, and nullish coalescing supplies the fallback.',
    estimated_minutes: 10,
    technology: { name: 'JavaScript', slug: 'javascript' },
    category: { name: 'JavaScript Errors', slug: 'javascript-errors' },
    hints: [
      { sequence: 1, hint: 'The crash happens while reading a nested property.' },
      { sequence: 2, hint: 'Guard the user and profile levels.' },
      { sequence: 3, hint: 'JavaScript optional chaining stops property access when a value is nullish.' },
    ],
    public_tests: [{ title: 'Displays a loading fallback', stdin: '', expected_output: 'Loading…' }],
  },
]

export async function getArenaChallenges(): Promise<ArenaChallenge[]> {
  if (!supabase) return fallbackChallenges
  const { data, error } = await supabase
    .from('arena_challenges')
    .select('id, title, slug, description, problem_statement, difficulty, language, starter_code, explanation, estimated_minutes, is_published, challenge_type, related_bug_id, technology:technologies(name, slug), category:arena_categories(name, slug)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) return fallbackChallenges
  return data?.length ? data as unknown as ArenaChallenge[] : fallbackChallenges
}

export async function getArenaChallenge(slug: string): Promise<ArenaChallenge | null> {
  if (!supabase) {
    const challenge = fallbackChallenges.find(challenge => challenge.slug === slug) ?? null
    if (!challenge) return null
    const { solution_code: _solution, ...publicChallenge } = challenge
    return publicChallenge
  }
  const { data, error } = await supabase
    .from('arena_challenges')
    .select('id, title, slug, description, problem_statement, difficulty, language, starter_code, explanation, estimated_minutes, technology:technologies(name, slug), category:arena_categories(name, slug), related_bug_id, hints:arena_hints(sequence, hint), public_tests:arena_test_cases(title, stdin, expected_output)')
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('arena_test_cases.is_public', true)
    .single()
  if (error) return fallbackChallenges.find(challenge => challenge.slug === slug) ?? null
  return data as unknown as ArenaChallenge
}

export async function getArenaCategories() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('arena_categories')
    .select('id, name, slug, description')
    .order('name')
  return error ? [] : (data ?? [])
}
