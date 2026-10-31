// Core types for BugShala

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type VerificationStatus =
  | 'editor_reviewed'
  | 'documentation_verified'
  | 'community_tested'
  | 'not_reviewed'

export type FeedbackType = 'helpful' | 'not_helpful'

export type SourceType = 'official_docs' | 'mdn' | 'github' | 'blog' | 'other'

export interface Technology {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  is_active: boolean
  bug_count?: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  bug_count?: number
  created_at: string
}

export interface BugReference {
  id: string
  bug_id: string
  title: string
  url: string
  source_type: SourceType
  created_at: string
}

export interface BugTag {
  id: string
  bug_id: string
  tag: string
}

export interface Bug {
  id: string
  title: string
  slug: string
  short_description: string
  quick_answer: string
  technology_id: string
  category_id: string
  difficulty: Difficulty
  content: string
  reproduction_steps: string | null
  incorrect_code: string | null
  corrected_code: string | null
  code_language: string
  supported_versions: string | null
  exact_error?: string | null
  search_keywords?: string[]
  common_causes?: string | null
  alternatives?: string | null
  common_mistakes?: string | null
  version_compatibility?: string | null
  prevention_tips?: string | null
  faq?: Array<{ question: string; answer: string }>
  verification_status: VerificationStatus
  estimated_reading_time: number
  helpful_count: number
  not_helpful_count: number
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  last_reviewed_at: string | null
  // Joined fields
  technology?: Technology
  category?: Category
  references?: BugReference[]
  tags?: BugTag[]
}

export interface BugListItem {
  id: string
  title: string
  slug: string
  short_description: string
  difficulty: Difficulty
  verification_status: VerificationStatus
  estimated_reading_time: number
  helpful_count: number
  published_at: string | null
  updated_at: string
  technology: {
    name: string
    slug: string
    icon: string
    color: string
  }
  category: {
    name: string
    slug: string
  }
}

export interface SearchResult {
  bugs: BugListItem[]
  total: number
  page: number
  per_page: number
  query: string
}

export interface FilterState {
  technology: string[]
  category: string[]
  difficulty: Difficulty[]
  verification_status: VerificationStatus[]
}

export interface SortOption {
  value: 'relevance' | 'recently_added' | 'recently_updated' | 'most_helpful'
  label: string
}

export interface SearchSuggestion {
  type: 'bug' | 'technology' | 'category'
  id: string
  title: string
  subtitle?: string
  href: string
}

export interface TOCItem {
  id: string
  text: string
  level: number
}

export interface FeedbackPayload {
  bug_id: string
  feedback_type: FeedbackType
  session_hash: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}
