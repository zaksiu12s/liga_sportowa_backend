import supabase from "./supabase";
import type { Tables } from "../types/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

// Kształt obiektu w jsonb
type StageTeamJsonb = {
  id: string;
  points: number;
  goals_for: number;
  goals_against: number;
};

// To co zwracamy na zewnątrz — z dołączoną nazwą
export type StageTeamRow = StageTeamJsonb & {
  name: string;
};

export type StageRow = Omit<Tables<"first_stage">, "teams"> & {
  teams: StageTeamRow[] | null;
};

// ─── Helper: wzbogać teams[] o nazwy z bazy ──────────────────────────────────

async function enrichTeamsWithNames(
  rawTeams: StageTeamJsonb[],
): Promise<StageTeamRow[]> {
  const ids = rawTeams.map((t) => t.id);

  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .in("id", ids);

  if (error) throw error;

  const nameMap = Object.fromEntries((data ?? []).map((t) => [t.id, t.name]));

  return rawTeams.map((t) => ({
    ...t,
    name: nameMap[t.id] ?? "Nieznana drużyna",
  }));
}

// ─── Helper: pobierz stage i wzbogać ─────────────────────────────────────────

async function fetchStage(
  table: "first_stage" | "second_stage",
): Promise<StageRow[]> {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;

  const rows = data ?? [];

  return Promise.all(
    rows.map(async (row) => {
      const rawTeams =
        (row.teams as { teams: StageTeamJsonb[] } | null)?.teams ?? [];
      const enriched = await enrichTeamsWithNames(rawTeams);
      return { ...row, teams: enriched };
    }),
  );
}

// ─── Teams ───────────────────────────────────────────────────────────────────

export async function getTeams() {
  const { data, error } = await supabase.from("teams").select("*");

  if (error) throw error;
  return data;
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      home_team:teams!matches_home_team_id_fkey (name),
      away_team:teams!matches_away_team_id_fkey (name)
    `,
    )
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return data;
}

// ─── Stages ──────────────────────────────────────────────────────────────────

export const getFirstStage = (): Promise<StageRow[]> =>
  fetchStage("first_stage");
export const getSecondStage = (): Promise<StageRow[]> =>
  fetchStage("second_stage");
