Supabase Database Schema
This document describes the PostgreSQL schema used in Supabase for the Liga Sportowa ZSEM application.

Tables overview
Schema: public

Tabele znalezione w schemacie public:

final_stage — Comment: types: semi-final-A, semi-final-B, final, 3rd-place
first_stage — Comment: Stage first of group matches
matches
players
second_stage — Comment: Second stage of group eliminations.
teams
Table: teams
Contains information about the teams participating in the league.

id: uuid (Primary Key, Default: uuid_generate_v4())
name: text (Required, unique) — Team name.
group: text (Nullable) — Group assignment (e.g., "A", "B", "C").
points: int4 (Default: 0) — Total points earned.
goals_for: int4 (Default: 0) — Total goals scored.
goals_against: int4 (Default: 0) — Total goals conceded.
created_at: timestamptz (Default: now())
Notes:

Table comment: (none)
RLS policies: A read policy exists on teams that enables read access for all users (policy name: "Enable read access for all users").
Indexes:

(No explicit indexes returned in the last query; fetch if needed.)
Table: matches
Contains the schedule and results of the matches.

id: uuid (Primary Key, Default: uuid_generate_v4())
home_team_id: uuid (Foreign Key -> teams.id)
away_team_id: uuid (Foreign Key -> teams.id)
score_home: int4 (Nullable) — Goals scored by the home team.
score_away: int4 (Nullable) — Goals scored by the away team.
status: text (Default: scheduled) — Enum values: scheduled, live, finished.
scheduled_at: timestamptz (Nullable) — Date and time of the match.
stage: text (Nullable) — Stage description (e.g., "Grupa A", "Półfinał").
created_at: timestamptz (Default: now())
Notes:

Table comment: (none)
RLS policies: A read policy exists on matches that enables read access for all users (policy name: "Enable read access for all users").
Foreign keys:

matches.home_team_id -> teams.id (fkey name: matches_home_team_id_fkey)
matches.away_team_id -> teams.id (fkey name: matches_away_team_id_fkey)
Indexes:

(No explicit indexes returned in the last query; fetch if needed.)
Table: players
Contains player information (inferred).

Columns (inferred):

id: uuid (Primary Key)
team_id: uuid (Foreign Key -> teams.id)
name: text
number: int4
position: text
created_at: timestamptz (Default: now())
Notes:

Table comment: (none)
RLS policies: (none found)
If you want exact columns for players, request an update and I will fetch column metadata.

Table: first_stage
Stage first of group matches.

Comment:

Stage first of group matches
Columns:

(Not enumerated; fetch exact column list if needed.)
RLS policies / Indexes / PK / FK:

(Not found in last export; fetch if needed.)
Table: second_stage
Second stage of group eliminations.

Comment:

Second stage of group eliminations.
Columns:

(Not enumerated; fetch exact column list if needed.)
RLS policies / Indexes / PK / FK:

(Not found in last export; fetch if needed.)
Table: final_stage
Types: semi-final-A, semi-final-B, final, 3rd-place

Comment:

types: semi-final-A, semi-final-B, final, 3rd-place
Columns:

(Not enumerated; fetch exact column list if needed.)
RLS policies / Indexes / PK / FK:

(Not found in last export; fetch if needed.)
Relationships (summary)
matches.home_team_id -> teams.id (fkey name: matches_home_team_id_fkey)
matches.away_team_id -> teams.id (fkey name: matches_away_team_id_fkey)
(If there are additional FKs for players/stages, they can be fetched and appended.)

Sorting Logic
Standings (teams): Ordered by points (desc) and then goals_for (desc).
Schedule (matches):
Upcoming: Ordered by scheduled_at (asc).
Finished: Ordered by scheduled_at (desc).
Views
(No views detected in the last query; fetch if needed.)
Functions
(No functions in public were returned in the detailed pull; fetch if needed.)
RLS Policies (detailed)
matches — "Enable read access for all users" — FOR SELECT — USING: true
teams — "Enable read access for all users" — FOR SELECT — USING: true
Comments
final_stage: types: semi-final-A, semi-final-B, final, 3rd-place
first_stage: Stage first of group matches
second_stage: Second stage of group eliminations.
other tables: no table comments found.