This project uses two npm scripts for Supabase Edge Functions:

- `npm run supabase-download`
  - Downloads the current versions of these functions from Supabase:
    - `mailer`
    - `report-generator`
- `npm run supabase-deploy`
  - Deploys these local functions to Supabase:
    - `mailer`
    - `report-generator`

Important dashboard setting (required for Bruno requests):

1. Open Supabase Dashboard.
2. Go to `Edge Functions` -> `Functions`.
3. Open each function used by Bruno.
4. Prefer keeping JWT verification enabled for admin/internal endpoints.

Use `--no-verify-jwt` (or equivalent dashboard setting) only for endpoints meant to be public/webhook-facing, and only when your function implements its own auth check (signature/token allowlist).

For this project:
- `mailer` and `report-generator` are admin endpoints and should require auth.
- Bruno calls should include a valid Bearer token from an authenticated admin user.

Recommended workflow when editing a function:

1. Run `npm run supabase-download` to sync the latest remote version.
2. Edit the function locally.
3. Run `npm run supabase-deploy` to publish changes.

Security checklist before deploy:

1. Verify auth logic exists in function code (`requireAuthUser` and/or signed secret check).
2. Ensure process/cron endpoints require a dedicated secret token.
3. Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
4. Re-run Supabase advisors (security + performance) after schema changes.

If you add a new Edge Function, also update npm scripts in `package.json` so it is included in both download and deploy commands.
