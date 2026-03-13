# Application Layout Design (Simplified)

This document outlines the visual and structural layout of the Liga Sportowa ZSEM application, based on the current simplified database structure.

## Global Layout (Main Wrapper)
- **Style**: Minimalistic, flat, high-contrast (B/W/R).
- **Background**: Solid White (`bg-white`).
- **Navbar**: Sticky top, white background, bottom border.
  - Links: START | TABELE | MECZE | FINAŁY
- **Footer**: Simple border-top, small uppercase text.

---

## 1. START (Home)
- **Hero**: Bold LIGA ZSEM title, centered monochromatic logo (as favicon), no scrolling.
- **Content**: Short description of the league.
- **Action**: "Regulamin PDF" button with sharp borders.

---

## 2. TABELE (Standings)
- **Data Source**: Fetched directly from the `teams` table.
- **Filtering**: Dynamic group buttons based on teams in the DB.
- **Table Columns**: Rank (#), Team Name, Goals (F:A), Points (PKT).
- **Visuals**: No shadows, no rounded corners, top 2 teams in red text.

---

## 3. MECZE (Schedule)
- **Data Source**: Fetched from the `matches` table.
- **Layout**: Centered list of matchups.
- **Items**: Team A vs Team B, Score (or "VS"), scheduled time and stage info.
- **Live State**: Pulsing "● NA ŻYWO" indicator removed (minimalism), replaced with static red text.

---

## 4. FINAŁY (Knockout Bracket)
- **Visualization**: Static grid representing Semifinals and Final.
- **Grand Final**: Highlighted with a black background box.

---

## Visual Aesthetics (Tailwind)
- **Primary Color**: `gray-900` (Black for text and borders).
- **Accent Color**: `red-600` (ZSEM branding).
- **Typography**: Sans-serif, extra-bold headers, wide-spaced subtext.
- **Borders**: Solid 1px or 2px (`border-gray-900` or `border-gray-100`).
