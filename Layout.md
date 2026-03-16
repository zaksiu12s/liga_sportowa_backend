# Application Layout Design

This document outlines the visual and structural layout of the Liga Sportowa ZSEM application.

## Global Layout (Main Wrapper)
- **Style**: Minimalistic, flat, high-contrast (B/W/R).
- **Background**: Solid White (`bg-white`).
- **Navbar**: Sticky top, white background, bottom border.
  - Links: START | TABELE | MECZE | FINAŁY (Note: Navigation items other than START are currently disabled in `App.tsx` and `Navbar.tsx`).
- **Footer**: Simple border-top, small uppercase text.

---

## 1. START (Home)
- **Hero**: Bold "LIGA ZSEM" title with "Szkolna Liga Piłki Nożnej 2026" subtext.
- **Content**: Short description of the league including ZSEM and JCE.
- **Action Buttons**: 
  - "Formularz zgłoszeniowy" -> `form.pdf`
  - "Zgoda na uczestnictwo" -> `consent.pdf`
  - "Regulamin" -> `rules.pdf`
- **Visuals**: Large uppercase tracking, sharp borders, hover effects (invert colors).

---

## 2. TABELE (Standings)
- **Stages**: Toggle between "ETAP 1" and "ETAP 2".
- **Groups**: Dynamic group buttons fetched from the database (e.g., A, B, C).
- **Table**: 
  - Columns: Rank (#), Team Name, Goals (F:A), Points (PKT).
  - Highlighting: Top 2 teams in red text.
  - Loading: Skeleton screens used during data fetch.

---

## 3. MECZE (Schedule)
- **Filters**: Toggle between "Nadchodzące" (Upcoming) and "Zakończone" (Finished).
- **Layout**: Centered list of matchups with vertical spacing.
- **Match Item**:
  - Teams: Left and Right aligned, uppercase, truncated if long.
  - Score/VS: Bold central divider.
  - Meta: Date, Time, and Stage info at the bottom.
  - Live State: "● NA ŻYWO" red indicator for active matches.
- **Pagination**: 5 items per page with "Poprzednie/Następne" controls.

---

## 4. FINAŁY (Knockout Bracket)
- **Visualization**: 3-column grid.
  - Column 1: Półfinały (Semifinals) list.
  - Column 2: Wielki Finał (Grand Final) highlighted with a black background and white text.
  - Column 3: Mecz o 3 Miejsce (3rd Place Match).
- **Status**: Currently a static placeholder in the implementation.

---

## Visual Aesthetics (Tailwind)
- **Primary Color**: `gray-900` (Black for text and borders).
- **Accent Color**: `red-600` (ZSEM branding).
- **Secondary Text**: `gray-400` or `gray-600` for subtext.
- **Typography**: Sans-serif, black weight for headers, extra tracking for labels.
- **Borders**: Solid 1px or 2px (`border-gray-900` or `border-gray-100`).
- **Transitions**: Simple `transition-all` on hoverable elements.
