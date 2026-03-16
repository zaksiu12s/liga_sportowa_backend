# Project Context: liga_sportowa

This project is a web application for a football league at **ZSEM (Zespół Szkół Elektryczno-Mechanicznych)** and **JCE (Jezuickie Centrum Edukacji)** in Nowy Sącz.

## Core Principles
- **Direct Supabase Integration:** The application communicates directly with Supabase's PostgreSQL database. There is no custom backend.
- **Data Management:** Data is managed manually through the Supabase dashboard.
- **Minimalistic Design:** The UI is strictly minimalistic, flat, and high-contrast (Black/White/Red).
  - No animations or complex transitions.
  - Sharp edges, solid borders, and clear spacing.
  - Typography-focused hierarchy.
- **Language:** The entire application interface and content must be in **Polish**.
- **Deployment:** The project is configured for deployment on GitHub Pages (`gh-pages`).

## Tournament Structure (ZSEM League 2026)
1. **Stage 1 (Groups):** 15 teams divided into 3 groups (A, B, C) of 5 teams each.
   - Top 2 from each group + 2 best 3rd-place teams advance to Stage 2.
2. **Stage 2 (Top 8):** 8 teams divided into 2 groups (A, B) of 4 teams each.
   - Top 2 from each group advance to the Semifinals.
3. **Stage 3 (Finals):** Semifinals, 3rd Place Match, and Grand Final.

## Key Documents (Public)
- `public/rules.pdf`: Official league regulations (Regulamin).
- `public/form.pdf`: Team registration form (Formularz zgłoszeniowy).
- `public/consent.pdf`: Participation consent form (Zgoda na uczestnictwo).
- `public/football_league_logo.jpg`: Official league logo (Minimalistic Black/White branding).

## Assets (Private)
- `assets_private/project_figma.png`: Visual design reference.

## Navigation Structure
- **START**: About the league, ZSEM/JCE logo, and links to registration documents and rules.
- **TABELE** (Currently disabled in App.tsx): Group stage standings (Stage 1 and Stage 2).
- **MECZE** (Currently disabled in App.tsx): Schedule of all matches (Live, Upcoming, Past) with pagination.
- **FINAŁY** (Currently disabled in App.tsx): Knockout bracket visualization (Static placeholder).

## Tech Stack
- **Frontend:** React 19 with TypeScript.
- **Analytics:** Vercel Analytics (`@vercel/analytics`).
- **Styling:** Tailwind CSS.
- **Build Tool:** Vite.
- **Database:** Supabase (`@supabase/supabase-js`).

## Database Schema
The application uses a simplified structure in the `public` schema. See [SUPABASE.md](./SUPABASE.md) for more details.
- **teams**: `id`, `name`, `group`, `points`, `goals_for`, `goals_against`.
- **matches**: `id`, `home_team_id`, `away_team_id`, `score_home`, `score_away`, `status` (scheduled/live/finished), `scheduled_at`, `stage`.

## Development Guidelines
- **Type Safety**: Use the generated types in `src/types/supabase.ts`.
- **Database Client**: Use the pre-configured client in `src/utils/supabase.ts` and data fetching methods in `src/utils/data.ts`.
- Use TypeScript for all components.
- Adhere to Tailwind CSS for all styling (no extra CSS files).
- Keep components modular and focused on data presentation.
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be configured in a `.env` file (not committed).

## Project Structure
- `src/App.tsx`: Main entry point and layout.
- `src/components/Layout/`: Navbar, Footer, and Skeleton components.
- `src/components/Views/`: Implementation of Home, Standings, Schedule, and Finals views.
- `src/utils/data.ts`: Centralized data fetching logic using Supabase.
- `src/types/`: TypeScript definitions for app state and Supabase tables.
