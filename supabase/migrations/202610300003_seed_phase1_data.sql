begin;

insert into public.technologies (name, slug, description, icon, color, is_active)
values
  ('React', 'react', 'Fix common React rendering, hooks, routing, and state errors.', 'atom', '#61DAFB', true),
  ('Next.js', 'nextjs', 'Diagnose Next.js App Router, rendering, routing, and deployment issues.', 'triangle', '#E7E9EE', true),
  ('JavaScript', 'javascript', 'Understand JavaScript runtime, syntax, scope, and async errors.', 'braces', '#F7DF1E', true),
  ('Node.js', 'nodejs', 'Resolve Node.js module, process, API, and runtime failures.', 'box', '#5FA04E', true),
  ('TypeScript', 'typescript', 'Make sense of TypeScript compiler errors and type definitions.', 'code', '#3178C6', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  is_active = excluded.is_active;

insert into public.categories (name, slug, description)
values
  ('Runtime Errors', 'runtime-errors', 'Errors thrown while an application is running.'),
  ('Build & Compile', 'build-compile', 'Compilation failures, bundler errors, and build configuration problems.'),
  ('Network & API', 'network-api', 'HTTP, CORS, fetching, and API integration issues.'),
  ('State & Hooks', 'state-hooks', 'State updates, hook rules, effects, and stale closures.'),
  ('Environment', 'environment', 'Environment variables, package managers, and local configuration.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.bugs (
  title, slug, short_description, quick_answer, technology_id, category_id, difficulty,
  content, incorrect_code, corrected_code, code_language, verification_status,
  estimated_reading_time, helpful_count, not_helpful_count, is_published, published_at
)
values
  (
    'Cannot read properties of undefined (reading user)', 'cannot-read-properties-of-undefined-user',
    'Safely handle asynchronous or missing data before reading nested properties.',
    'Guard the optional chain and provide a loading or fallback state while data is unavailable.',
    (select id from public.technologies where slug = 'react'), (select id from public.categories where slug = 'runtime-errors'),
    'beginner', '## Why this happens

JavaScript tries to read a property from an undefined value.

## The fix

Use optional chaining and a fallback while data is unavailable.',
    'const name = currentUser.profile.name', 'const name = currentUser?.profile?.name ?? ''Loading…''', 'tsx',
    'editor_reviewed', 4, 42, 2, true, now()
  ),
  (
    'Hydration failed because the server rendered HTML did not match', 'react-hydration-mismatch',
    'Find and remove nondeterministic markup from the initial render.',
    'Make server and client output identical during the initial render.',
    (select id from public.technologies where slug = 'react'), (select id from public.categories where slug = 'runtime-errors'),
    'intermediate', '## Why this happens

Initial client and server output differs during React hydration.

## The fix

Use deterministic initial values and move browser-only behavior after mounting.',
    'const value = Math.random(); return <span>{value}</span>', 'const [value, setValue] = useState(0); useEffect(() => setValue(Math.random()), [])', 'tsx',
    'editor_reviewed', 4, 42, 2, true, now()
  ),
  (
    'CORS policy blocked the requested resource', 'cors-policy-blocked-resource',
    'Configure the API origin correctly or proxy requests through Next.js.',
    'Allow the trusted origin on the API or use a same-origin API route.',
    (select id from public.technologies where slug = 'nextjs'), (select id from public.categories where slug = 'network-api'),
    'intermediate', '## Why this happens

The browser blocks a cross-origin response that does not allow the requesting origin.

## The fix

Configure trusted origins on the API or route requests through the Next.js server.',
    'await fetch(''https://api.example.com/data'')', '// Use a same-origin Next.js route handler
await fetch(''/api/data'')', 'typescript',
    'editor_reviewed', 4, 42, 2, true, now()
  ),
  (
    'Module not found: Cannot find package or module', 'module-not-found-package',
    'Resolve a missing dependency, incorrect import path, or outdated installation.',
    'Verify the package name, install it, and restart the development server.',
    (select id from public.technologies where slug = 'javascript'), (select id from public.categories where slug = 'build-compile'),
    'beginner', '## Why this happens

A package or local module cannot be resolved.

## The fix

Install the dependency and verify the import path.',
    'import { something } from ''missing-package''', 'npm install missing-package
import { something } from ''missing-package''', 'javascript',
    'editor_reviewed', 4, 42, 2, true, now()
  ),
  (
    'EADDRINUSE: address already in use', 'eaddrinuse-address-already-in-use',
    'Find the process using the port and stop it or choose another port.',
    'Identify the occupying process and stop it only when safe.',
    (select id from public.technologies where slug = 'nodejs'), (select id from public.categories where slug = 'environment'),
    'beginner', '## Why this happens

Another process is already listening on the requested port.

## The fix

Find the process and stop it, or start the application on another port.',
    'node server.js', 'netstat -ano | findstr :3000
node server.js --port 3001', 'bash',
    'editor_reviewed', 4, 42, 2, true, now()
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  quick_answer = excluded.quick_answer,
  technology_id = excluded.technology_id,
  category_id = excluded.category_id,
  difficulty = excluded.difficulty,
  content = excluded.content,
  incorrect_code = excluded.incorrect_code,
  corrected_code = excluded.corrected_code,
  is_published = true;

notify pgrst, 'reload schema';
commit;
