begin;

alter table public.bugs add column if not exists search_keywords text[] not null default '{}';
alter table public.bugs add column if not exists exact_error text;
alter table public.bugs add column if not exists common_causes text;
alter table public.bugs add column if not exists alternatives text;
alter table public.bugs add column if not exists common_mistakes text;
alter table public.bugs add column if not exists version_compatibility text;
alter table public.bugs add column if not exists prevention_tips text;
alter table public.bugs add column if not exists faq jsonb not null default '[]'::jsonb;

insert into public.technologies (name, slug, description, icon, color, is_active) values
('HTML', 'html', 'Resolve HTML structure, accessibility, semantics, and browser rendering issues.', 'code', '#E34F26', true),
('CSS', 'css', 'Fix layout, cascade, specificity, responsive design, and rendering problems.', 'palette', '#663399', true),
('Python', 'python', 'Diagnose Python runtime, syntax, package, and application errors.', 'terminal', '#3776AB', true),
('Java', 'java', 'Resolve Java compilation, runtime, JVM, and dependency problems.', 'coffee', '#F89820', true),
('C and C++', 'c-cpp', 'Debug native compiler, memory, linking, and runtime failures.', 'cpu', '#659AD2', true),
('PHP', 'php', 'Fix PHP runtime, syntax, package, session, and web server issues.', 'terminal', '#777BB4', true),
('Git and GitHub', 'git-github', 'Resolve Git history, merge, authentication, and collaboration problems.', 'git-branch', '#F05032', true),
('npm and package management', 'npm-packages', 'Resolve dependency, lockfile, version, and package installation issues.', 'package', '#CB3837', true),
('SQL', 'sql', 'Diagnose SQL syntax, joins, constraints, transactions, and query performance.', 'database', '#336791', true),
('PostgreSQL', 'postgresql', 'Resolve PostgreSQL connections, queries, locks, and server configuration.', 'database', '#4169E1', true),
('MySQL', 'mysql', 'Resolve MySQL syntax, schema, connection, locking, and query issues.', 'database', '#4479A1', true),
('MongoDB', 'mongodb', 'Debug MongoDB schema, connection, query, indexing, and aggregation issues.', 'database', '#47A248', true),
('Firebase', 'firebase', 'Fix Firebase authentication, Firestore rules, indexing, and deployment problems.', 'flame', '#FFCA28', true),
('Docker', 'docker', 'Diagnose Docker builds, containers, networking, volumes, and Compose errors.', 'box', '#2496ED', true),
('Linux', 'linux', 'Resolve Linux permissions, services, shell commands, and networking issues.', 'terminal', '#FCC624', true),
('REST APIs and HTTP', 'rest-http', 'Debug HTTP status codes, headers, methods, payloads, and API contracts.', 'globe', '#C5F36A', true),
('Authentication and Networking', 'auth-networking', 'Resolve authentication, authorization, TLS, JWT, proxy, and network problems.', 'shield', '#C5F36A', true),
('Deployment and DevOps', 'devops-deployment', 'Fix CI/CD, environment, hosting, reverse proxy, and production reliability issues.', 'cloud', '#C5F36A', true)
on conflict (slug) do update set name=excluded.name, description=excluded.description, icon=excluded.icon, color=excluded.color, is_active=true;

insert into public.categories (name, slug, description) values
('Runtime Errors','runtime-errors','Errors thrown while an application is running.'),
('Build & Compile','build-compile','Compilation failures, bundler errors, and build configuration problems.'),
('Network & API','network-api','HTTP, CORS, fetching, and API integration issues.'),
('State & Hooks','state-hooks','State updates, hook rules, effects, and stale closures.'),
('Environment','environment','Environment variables, package managers, and local configuration.'),
('Data & Database','data-database','Schema, query, transaction, connection, and data integrity problems.'),
('Performance','performance','Latency, memory, concurrency, and scalability problems.'),
('Security','security','Authentication, authorization, secrets, and trust boundary problems.'),
('Deployment','deployment','Hosting, containers, CI/CD, proxies, and production configuration.')
on conflict (slug) do update set name=excluded.name, description=excluded.description;

notify pgrst, 'reload schema';
commit;
