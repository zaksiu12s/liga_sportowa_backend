# Security Guide

This project uses Supabase Auth + Edge Functions. Use this checklist for safer operations.

## Critical Rules

- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server/Edge Function env vars.
- Do not disable JWT verification globally for admin/internal functions.
- Require explicit auth for all write operations.
- Protect cron/process endpoints with a dedicated token.

## Edge Function Rules

- `mailer`:
  - `/enqueue`, `/update`, `/delete` require authenticated user.
  - `/process` must require `MAILER_PROCESS_TOKEN` (`x-mailer-token` header).
- `report-generator`:
  - Must require authenticated user for generation/rewrite.

## Frontend Rules

- Frontend calls to mutating Edge routes must include a real user access token.
- Do not fall back to direct DB writes from client when Edge auth fails.

## Supabase Advisor Findings (Action Items)

Generated from Supabase advisors for project `vqtdjmmsuuucozxfeaiw`:

- Security:
  - Enable RLS on `public.top_scorers` and keep explicit read policy.
  - Review permissive policies (`USING true`, `WITH CHECK true`) on stage tables.
  - Set stable `search_path` on SQL functions (`update_top_scorers`, triggers).
- Performance:
  - Add missing foreign-key indexes (`matches`, `final_stage`, `players`).
  - Review duplicate permissive policies and remove redundant ones.

## Deployment Hygiene

- Re-run `get_advisors` after each DDL migration.
- Prefer additive, idempotent SQL migrations (`IF NOT EXISTS`, guarded `DO $$` blocks).
- Validate production behavior with `npm run build` before function deploy.
