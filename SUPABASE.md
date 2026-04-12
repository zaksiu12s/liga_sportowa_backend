# Supabase Database Schema

This document describes the PostgreSQL schema used in Supabase for the Liga Sportowa ZSEM application.

## Table: teams
Contains information about the teams participating in the league.

- `id`: `uuid` (Primary Key, Default: `uuid_generate_v4()`)
- `name`: `text` (Required, unique) - Team name.
- `group`: `text` (Nullable) - Group assignment (e.g., "A", "B", "C").
- `points`: `int4` (Default: 0) - Total points earned.
- `goals_for`: `int4` (Default: 0) - Total goals scored.
- `goals_against`: `int4` (Default: 0) - Total goals conceded.
- `created_at`: `timestamptz` (Default: `now()`)

## Table: matches
Contains the schedule and results of the matches.

- `id`: `uuid` (Primary Key, Default: `uuid_generate_v4()`)
- `home_team_id`: `uuid` (Foreign Key -> `teams.id`)
- `away_team_id`: `uuid` (Foreign Key -> `teams.id`)
- `score_home`: `int4` (Nullable) - Goals scored by the home team.
- `score_away`: `int4` (Nullable) - Goals scored by the away team.
- `status`: `text` (Default: 'scheduled') - Enum: `scheduled`, `live`, `finished`.
- `scheduled_at`: `timestamptz` (Nullable) - Date and time of the match.
- `stage`: `text` (Nullable) - Stage description (e.g., "Grupa A", "Półfinał").
- `created_at`: `timestamptz` (Default: `now()`)

## Table: navigation_settings
Contains public navbar visibility configuration controlled from the admin panel.

- `path`: `text` (Primary Key) - Route path, e.g. `/teams`.
- `label`: `text` (Required) - Display name in navbar.
- `is_hidden`: `boolean` (Default: `false`) - Whether item is hidden for users.
- `updated_at`: `timestamptz` (Default: `now()`) - Last update timestamp.

## Relationships
- `matches.home_team_id` -> `teams.id` (fkey name: `matches_home_team_id_fkey`)
- `matches.away_team_id` -> `teams.id` (fkey name: `matches_away_team_id_fkey`)

## Security Notes
- Keep Row Level Security enabled for all public schema tables exposed to client APIs.
- For public read tables (for example standings/statistics), create explicit `SELECT` policies and avoid broad write policies.
- Edge Functions should enforce auth in code (`requireAuthUser`) and use dedicated secret headers for cron/process endpoints.

## Performance Notes
- Add covering indexes for foreign keys used in joins/filters (`matches.home_team_id`, `matches.away_team_id`, `players.team_id`, `final_stage.home_team_id`, `final_stage.away_team_id`).
- Review and remove redundant permissive RLS policies to reduce policy evaluation overhead.

## Sorting Logic
- **Standings (teams)**: Ordered by `points` (desc) and then `goals_for` (desc).
- **Schedule (matches)**:
  - Upcoming: Ordered by `scheduled_at` (asc).
  - Finished: Ordered by `scheduled_at` (desc).
