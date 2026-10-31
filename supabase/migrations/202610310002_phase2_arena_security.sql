begin;

revoke all privileges on table public.arena_challenges from anon, authenticated;
grant select (
  id, title, slug, description, problem_statement, category_id, technology_id, related_bug_id,
  difficulty, language, challenge_type, starter_code, explanation, estimated_minutes,
  is_published, created_at, updated_at
) on public.arena_challenges to anon, authenticated;

grant select on public.arena_categories, public.arena_hints, public.arena_test_cases to anon, authenticated;

revoke insert, update, delete on public.arena_challenges,
  public.arena_categories, public.arena_hints, public.arena_test_cases,
  public.arena_challenge_tags, public.arena_submissions, public.arena_submission_results
from anon, authenticated;

notify pgrst, 'reload schema';
commit;
