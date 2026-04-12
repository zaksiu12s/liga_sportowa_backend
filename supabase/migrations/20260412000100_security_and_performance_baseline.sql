-- Security + performance baseline hardening
-- Generated after Supabase advisor review (security + performance)

begin;

-- 1) Performance: foreign-key covering indexes
create index if not exists idx_matches_home_team_id on public.matches (home_team_id);
create index if not exists idx_matches_away_team_id on public.matches (away_team_id);
create index if not exists idx_players_team_id on public.players (team_id);
create index if not exists idx_final_stage_home_team_id on public.final_stage (home_team_id);
create index if not exists idx_final_stage_away_team_id on public.final_stage (away_team_id);

-- 2) Security: ensure RLS is enabled for top_scorers
alter table public.top_scorers enable row level security;

-- Keep public read policy explicit and idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'top_scorers'
      AND policyname = 'top_scorers_public_read'
  ) THEN
    CREATE POLICY top_scorers_public_read
      ON public.top_scorers
      FOR SELECT
      USING (true);
  END IF;
END
$$;

-- 3) Security: set stable search_path for functions flagged by advisors
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_top_scorers'
  ) THEN
    EXECUTE 'alter function public.update_top_scorers() set search_path = public, extensions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'trigger_update_top_scorers'
  ) THEN
    EXECUTE 'alter function public.trigger_update_top_scorers() set search_path = public, extensions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'set_navigation_settings_updated_at'
  ) THEN
    EXECUTE 'alter function public.set_navigation_settings_updated_at() set search_path = public, extensions';
  END IF;
END
$$;

commit;
