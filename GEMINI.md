# Project Context: liga_sportowa

This project is a web application for a football league at **ZSEM (Zespół Szkół Elektryczno-Mechanicznych)** in Nowy Sącz (zsem.edu.pl).

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

## Key Documents
- `public/rules.pdf`: Official league regulations (Regulamin).
- `public/football_league_logo.jpg`: Official league logo (Minimalistic Black/White branding).
- `assets_private/project_figma.png`: Visual design reference.
- `Layout.md`: Detailed layout and design specifications.

## Navigation Structure
- **START**: About the league, ZSEM logo, and link to rules.
- **TABELE**: Group stage standings (Stage 1 and Stage 2).
- **MECZE**: Schedule of all matches (Live, Upcoming, Past).
- **FINAŁY**: Knockout bracket visualization.

## Tech Stack
- **Frontend:** React 19 with TypeScript.
- **Styling:** Tailwind CSS.
- **Build Tool:** Vite.
- **Database/Auth:** Supabase (`@supabase/supabase-js`).

## Database Schema
The application uses a simplified structure in the `public` schema:

- **teams**: Contains team names, their group assignment, and real-time standings data (points, goals_for, goals_against).
- **matches**: Contains match schedules, scores, status (live/finished), and tournament stage.

## Development Guidelines
- **Type Safety**: Use the generated types in `src/types/supabase.ts`.
- **Database Client**: Use the pre-configured client in `src/utils/supabase.ts`.
- Use TypeScript for all new components.
- Adhere to Tailwind CSS for all styling.
- Keep components modular and focused on data presentation.
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be configured in a `.env` file (not committed).

## Project Structure
- `src/utils/supabase.ts`: Supabase client configuration.
- `src/App.tsx`: Main entry point and layout.
- `src/components/`: (To be created) UI components for matches, tables, etc.
