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

## Relationships
- `matches.home_team_id` -> `teams.id` (fkey name: `matches_home_team_id_fkey`)
- `matches.away_team_id` -> `teams.id` (fkey name: `matches_away_team_id_fkey`)

## Sorting Logic
- **Standings (teams)**: Ordered by `points` (desc) and then `goals_for` (desc).
- **Schedule (matches)**:
  - Upcoming: Ordered by `scheduled_at` (asc).
  - Finished: Ordered by `scheduled_at` (desc).
