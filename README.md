# Szkolna Liga Piłki Nożnej ZSEM 2026

Oficjalna aplikacja internetowa dla szkolnej ligi piłki nożnej w **Zespole Szkół Elektryczno-Mechanicznych (ZSEM)** w Nowym Sączu.

## 🏆 O Projekcie

Aplikacja służy do wyświetlania aktualnych tabel, terminarza oraz wyników fazy finałowej rozgrywek piłkarskich. Została zaprojektowana z myślą o szybkości i czytelności, wykorzystując bezpośrednią integrację z bazą danych Supabase.

## 🎨 Zasady Projektowe (Minimalizm)

Projekt charakteryzuje się surowym, minimalistycznym stylem:

- **Brak Animacji:** Interfejs jest statyczny, co zapewnia natychmiastowe działanie.
- **Wysoki Kontrast:** Kolorystyka oparta na czerni, bieli i akcentach czerwieni (barwy ZSEM).
- **Brutalistyczny Układ:** Ostre krawędzie, wyraźne obramowania i nacisk na typografię.
- **Płaski Design:** Brak cieni, zaokrągleń i zbędnych dekoracji.

## 🛠️ Stos Technologiczny

- **Frontend:** React 19 + TypeScript
- **Stylizowanie:** Tailwind CSS
- **Narzędzie Budowania:** Vite
- **Baza Danych:** Supabase (PostgreSQL)
- **Deployment:** GitHub Pages (`gh-pages`)

## 📋 Struktura Rozgrywek

1. **Etap 1 (Grupy):** 15 drużyn w 3 grupach (A, B, C).
2. **Etap 2 (TOP 8):** 8 najlepszych drużyn w 2 grupach.
3. **Etap 3 (Finały):** Półfinały, mecz o 3. miejsce oraz Wielki Finał.

## 🚀 Uruchomienie Lokalne

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/zaksiu12s/liga_sportowa_backend.git
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Skonfiguruj plik `.env` (użyj `.env.example` jako wzoru):
   ```env
   VITE_SUPABASE_URL=twoj_url
   VITE_SUPABASE_ANON_KEY=twoj_klucz
   ```
4. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## 📂 Struktura Projektu

- `src/components/Layout/`: Główne elementy nawigacyjne (Navbar, Footer).
- `src/components/Views/`: Główne widoki aplikacji (Home, Standings, Schedule, Finals).
- `src/utils/supabase.ts`: Konfiguracja klienta Supabase.
- `src/types/supabase.ts`: Wygenerowane typy bazy danych.

## 📄 Licencja

Projekt stworzony dla społeczności ZSEM Nowy Sącz. Regulamin rozgrywek dostępny w pliku `public/rules.pdf`.
