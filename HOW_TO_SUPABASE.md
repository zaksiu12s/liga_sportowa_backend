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
4. In function settings, set `Verify JWT with legacy secret` to `OFF`.

If this is not turned off, Bruno requests will fail.

Recommended workflow when editing a function:

1. Run `npm run supabase-download` to sync the latest remote version.
2. Edit the function locally.
3. Run `npm run supabase-deploy` to publish changes.

If you add a new Edge Function, also update npm scripts in `package.json` so it is included in both download and deploy commands.
