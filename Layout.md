# Application Layout Design

This document outlines the visual and structural layout of the Liga Sportowa ZSEM application, based on the Figma designs and league rules.

## Global Layout (Main Wrapper)
- **Background**: Light Grey (`bg-gray-100` or `bg-slate-50`).
- **Navbar**: Sticky top, dark grey/black background (`bg-gray-900`), white text.
  - Links: [Logo ZSEM] | Home | Tabele | Terminarz | Finały
- **Footer**: Simple dark footer with school info and link to `rules.pdf`.

---

## 1. Strona Główna (Home)
- **Hero Section**: Large ZSEM logo, title "Szkolna Liga Piłki Nożnej 2026".
- **About**: Short description of the league (ZSEM + JCE collaboration).
- **Documents Card**: A dedicated card to download/view the `Regulamin (rules.pdf)`.
- **Quick Links**: Buttons leading to the current group standings or the next upcoming match.

---

## 2. Tabele / Rankingi (Standings)
- **Tabs/Toggle**: Switch between **"Etap 1: Grupy (A, B, C)"** and **"Etap 2: TOP 8"**.
- **Stage 1 View**:
  - Three separate tables (Group A, Group B, Group C).
  - Columns: Rank, Team Name, Played, Goals (F:A), Pts.
  - Visual highlight for the top 2 teams (Qualifying zone).
- **Stage 2 View**:
  - Two tables (Group A, Group B).
  - Qualification highlights for Semifinals.

---

## 3. Terminarz (Schedule)
- **Filter**: Dropdown to select "Kolejka" (Round) or "All matches".
- **Match Cards**:
  - **Live Match**: Red border/pulse effect, "TERAZ" label.
  - **Upcoming**: Scheduled time, team names, "NASTĘPNY" label for the very next one.
  - **Completed**: Score clearly visible, greyed out style.
- **Layout**: List view, centered on the page.

---

## 4. Finały (Knockout Bracket)
- **Visualization**: Horizontal bracket system.
  - **Semifinals**: 2 matches (1A vs 2B, 1B vs 2A).
  - **3rd Place Match**: Losers of semifinals.
  - **Grand Final**: Winners of semifinals.
- **Design**: Clean connectors (lines) between match boxes.

---

## Visual Aesthetics (Tailwind)
- **Primary Color**: `gray-900` (Header/Text).
- **Secondary Color**: `gray-200` / `gray-300` (Containers/Borders).
- **Accent Color**: `red-600` (Live indicators, school branding accent).
- **Logo**: Official Red/White square logo (`public/football_league_logo.jpg`).
- **Typography**: Sans-serif, bold headers for readability.
- **Responsive**: All views must stack vertically on mobile (as seen in Figma's iPhone frames).
