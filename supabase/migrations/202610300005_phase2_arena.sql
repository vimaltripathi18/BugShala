begin;

create table if not exists public.arena_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.arena_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  problem_statement text not null,
  category_id uuid references public.arena_categories(id) on delete set null,
  technology_id uuid references public.technologies(id) on delete set null,
  related_bug_id uuid references public.bugs(id) on delete set null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  language text not null,
  starter_code text not null default '',
  solution_code text not null default '',
  explanation text not null default '',
  estimated_minutes integer check (estimated_minutes between 5 and 240),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arena_challenge_tags (
  challenge_id uuid not null references public.arena_challenges(id) on delete cascade,
  tag text not null,
  primary key (challenge_id, tag)
);

create table if not exists public.arena_hints (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.arena_challenges(id) on delete cascade,
  sequence integer not null check (sequence between 1 and 3),
  hint text not null,
  unique (challenge_id, sequence)
);

create table if not exists public.arena_test_cases (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.arena_challenges(id) on delete cascade,
  title text not null default '',
  stdin text not null default '',
  expected_output text not null,
  is_public boolean not null default false,
  position integer not null default 0
);

create table if not exists public.arena_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.arena_challenges(id) on delete cascade,
  session_hash text not null,
  language text not null,
  source_code text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'unavailable')),
  passed_count integer not null default 0,
  total_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.arena_submission_results (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.arena_submissions(id) on delete cascade,
  test_case_id uuid references public.arena_test_cases(id) on delete set null,
  status text not null check (status in ('passed', 'failed', 'error', 'timeout')),
  stdout text,
  stderr text,
  created_at timestamptz not null default now()
);

create index if not exists arena_challenges_published_idx on public.arena_challenges(is_published, difficulty);
create index if not exists arena_challenges_category_idx on public.arena_challenges(category_id);
create index if not exists arena_challenges_technology_idx on public.arena_challenges(technology_id);
create index if not exists arena_submissions_challenge_idx on public.arena_submissions(challenge_id, created_at desc);

alter table public.arena_categories enable row level security;
alter table public.arena_challenges enable row level security;
alter table public.arena_challenge_tags enable row level security;
alter table public.arena_hints enable row level security;
alter table public.arena_test_cases enable row level security;
alter table public.arena_submissions enable row level security;
alter table public.arena_submission_results enable row level security;

create policy "Public can read arena categories" on public.arena_categories for select to anon, authenticated using (true);
create policy "Public can read published arena challenges" on public.arena_challenges for select to anon, authenticated using (is_published);
create policy "Public can read challenge tags" on public.arena_challenge_tags for select to anon, authenticated using (exists (select 1 from public.arena_challenges c where c.id = challenge_id and c.is_published));
create policy "Public can read challenge hints" on public.arena_hints for select to anon, authenticated using (exists (select 1 from public.arena_challenges c where c.id = challenge_id and c.is_published));
create policy "Public can read public test cases" on public.arena_test_cases for select to anon, authenticated using (is_public and exists (select 1 from public.arena_challenges c where c.id = challenge_id and c.is_published));
create policy "No public submission access" on public.arena_submissions for select using (false);
create policy "No public submission result access" on public.arena_submission_results for select using (false);

insert into public.arena_categories (name, slug, description) values
('JavaScript Errors', 'javascript-errors', 'Debug runtime, asynchronous, and language-level JavaScript failures.'),
('React Debugging', 'react-debugging', 'Fix rendering, state, effects, and hook problems in React.'),
('Node.js Problems', 'nodejs-problems', 'Diagnose server-side JavaScript, modules, and asynchronous failures.'),
('TypeScript Issues', 'typescript-issues', 'Repair type errors and unsafe TypeScript code.'),
('API and Networking', 'api-networking', 'Resolve requests, responses, headers, and network errors.'),
('CSS and HTML Problems', 'css-html-problems', 'Repair browser layout, markup, and selector problems.'),
('Database Problems', 'database-problems', 'Diagnose queries, constraints, and data consistency issues.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

notify pgrst, 'reload schema';
commit;
