# Project Context: liga_sportowa

This project is a web application for a football league at **ZSEM (Zespół Szkół Elektryczno-Mechanicznych)** in Nowy Sącz (zsem.edu.pl).

## Core Principles
- **Direct Supabase Integration:** The application communicates directly with Supabase's PostgreSQL database. There is no custom backend.
- **Data Management:** Data is managed manually through the Supabase dashboard. The application is primarily responsible for fetching and displaying this data.
- **Simplicity:** The focus is on clean, readable displays of league information (standings, matches, teams) rather than complex interactive features.

## Tech Stack
- **Frontend:** React 19 with TypeScript.
- **Styling:** Tailwind CSS.
- **Build Tool:** Vite.
- **Database/Auth:** Supabase (`@supabase/supabase-js`).

## Database Schema (Planned/Current)
- The application currently has a boilerplate `todos` fetch in `App.tsx`.
- Future tables will likely include `teams`, `matches`, `players`, and `standings`.

## Development Guidelines
- Use TypeScript for all new components.
- Adhere to Tailwind CSS for all styling.
- Keep components modular and focused on data presentation.
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be configured in a `.env` file (not committed).

## Project Structure
- `src/utils/supabase.ts`: Supabase client configuration.
- `src/App.tsx`: Main entry point and layout.
- `src/components/`: (To be created) UI components for matches, tables, etc.
