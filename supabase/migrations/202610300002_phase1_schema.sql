begin;

create extension if not exists pgcrypto;

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  icon text not null default '',
  color text not null default '#747986',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.bugs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  quick_answer text not null default '',
  technology_id uuid not null references public.technologies(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  content text not null default '',
  reproduction_steps text,
  incorrect_code text,
  corrected_code text,
  code_language text not null default 'javascript',
  supported_versions text,
  verification_status text not null default 'not_reviewed' check (verification_status in ('editor_reviewed', 'documentation_verified', 'community_tested', 'not_reviewed')),
  estimated_reading_time integer not null default 4,
  helpful_count integer not null default 0,
  not_helpful_count integer not null default 0,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_reviewed_at timestamptz
);

create table if not exists public.bug_references (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid not null references public.bugs(id) on delete cascade,
  title text not null,
  url text not null,
  source_type text not null check (source_type in ('official_docs', 'mdn', 'github', 'blog', 'other')),
  created_at timestamptz not null default now()
);

create table if not exists public.bug_tags (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid not null references public.bugs(id) on delete cascade,
  tag text not null,
  unique (bug_id, tag)
);

create table if not exists public.bug_feedback (
  id uuid primary key default gen_random_uuid(),
  bug_id uuid not null references public.bugs(id) on delete cascade,
  feedback_type text not null check (feedback_type in ('helpful', 'not_helpful')),
  session_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists bugs_published_idx on public.bugs(is_published, published_at desc);
create index if not exists bugs_technology_idx on public.bugs(technology_id);
create index if not exists bugs_category_idx on public.bugs(category_id);

alter table public.technologies enable row level security;
alter table public.categories enable row level security;
alter table public.bugs enable row level security;
alter table public.bug_references enable row level security;
alter table public.bug_tags enable row level security;
alter table public.bug_feedback enable row level security;

drop policy if exists "Public can read active technologies" on public.technologies;
create policy "Public can read active technologies"
  on public.technologies for select to anon, authenticated using (is_active);
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select to anon, authenticated using (true);
drop policy if exists "Public can read published bugs" on public.bugs;
create policy "Public can read published bugs"
  on public.bugs for select to anon, authenticated using (is_published);
drop policy if exists "Public can read references for published bugs" on public.bug_references;
create policy "Public can read references for published bugs"
  on public.bug_references for select to anon, authenticated
  using (exists (select 1 from public.bugs where bugs.id = bug_references.bug_id and bugs.is_published));
drop policy if exists "Public can read tags for published bugs" on public.bug_tags;
create policy "Public can read tags for published bugs"
  on public.bug_tags for select to anon, authenticated
  using (exists (select 1 from public.bugs where bugs.id = bug_tags.bug_id and bugs.is_published));

commit;
