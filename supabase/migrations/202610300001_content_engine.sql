begin;

create extension if not exists pgcrypto;

create table if not exists public.source_registry (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('stack_exchange', 'github', 'official_docs', 'other')),
  name text not null unique,
  base_url text,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_repositories (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.source_registry(id) on delete cascade,
  external_repository_id text,
  owner text,
  repository text,
  technology_slug text,
  enabled boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, owner, repository)
);

create table if not exists public.discovery_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  technology_slug text,
  category_slug text,
  priority integer not null default 50 check (priority between 0 and 100),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (keyword, technology_slug)
);

create table if not exists public.discovery_records (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.source_registry(id),
  source_external_id text not null,
  source_url text,
  fingerprint text not null,
  title text not null,
  raw_content text,
  technology_slug text,
  category_slug text,
  source_metadata jsonb not null default '{}'::jsonb,
  relevance_score numeric(5,2) check (relevance_score between 0 and 100),
  source_quality_score numeric(5,2) check (source_quality_score between 0 and 100),
  status text not null default 'discovered' check (status in ('discovered', 'queued', 'generated', 'review', 'published', 'rejected', 'ignored')),
  error text,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_external_id),
  unique (fingerprint)
);

create table if not exists public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.source_registry(id) on delete cascade,
  discovery_record_id uuid references public.discovery_records(id) on delete cascade,
  snapshot_url text,
  content_hash text not null,
  content jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now()
);

create table if not exists public.collection_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  source_id uuid references public.source_registry(id),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  attempt_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.collection_jobs(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.article_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  discovery_record_id uuid not null references public.discovery_records(id),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12,6),
  attempt_count integer not null default 0,
  draft_bug_id uuid,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.article_verification_results (
  id uuid primary key default gen_random_uuid(),
  generation_job_id uuid not null references public.article_generation_jobs(id) on delete cascade,
  confidence_score numeric(5,2) not null check (confidence_score between 0 and 100),
  source_verified boolean not null default false,
  content_valid boolean not null default false,
  code_valid boolean not null default false,
  restricted_topic boolean not null default false,
  checked_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  unique (generation_job_id)
);

create table if not exists public.content_review_queue (
  id uuid primary key default gen_random_uuid(),
  generation_job_id uuid not null references public.article_generation_jobs(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (generation_job_id)
);

create table if not exists public.automation_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists discovery_records_status_idx on public.discovery_records(status);
create index if not exists discovery_records_technology_idx on public.discovery_records(technology_slug);
create index if not exists discovery_records_fingerprint_idx on public.discovery_records(fingerprint);
create index if not exists collection_jobs_status_idx on public.collection_jobs(status);
create index if not exists generation_jobs_status_idx on public.article_generation_jobs(status);
insert into public.source_registry (type, name, enabled)
values ('stack_exchange', 'Stack Overflow', true), ('github', 'GitHub Issues', true)
on conflict (name) do nothing;

insert into public.discovery_keywords (keyword, technology_slug, category_slug, priority)
values
  ('javascript error', 'javascript', 'runtime-errors', 90),
  ('typescript error', 'typescript', 'build-compile', 90),
  ('react error', 'react', 'runtime-errors', 85),
  ('next.js error', 'nextjs', 'runtime-errors', 85),
  ('node error', 'nodejs', 'runtime-errors', 80)
on conflict (keyword, technology_slug) do update set
  category_slug = excluded.category_slug,
  priority = excluded.priority;

create index if not exists review_queue_status_idx on public.content_review_queue(status);

alter table public.source_registry enable row level security;
alter table public.source_repositories enable row level security;
alter table public.discovery_keywords enable row level security;
alter table public.discovery_records enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.collection_jobs enable row level security;
alter table public.collection_job_logs enable row level security;
alter table public.article_generation_jobs enable row level security;
alter table public.article_verification_results enable row level security;
alter table public.content_review_queue enable row level security;
alter table public.automation_settings enable row level security;

commit;
