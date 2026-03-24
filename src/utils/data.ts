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

// async function enrichTeamsWithNames(
//   rawTeams: StageTeamJsonb[],
// ): Promise<StageTeamRow[]> {
//   const ids = rawTeams.map((t) => t.id);

//   const { data, error } = await supabase
//     .from("teams")
//     .select("*")
//     .in("id", ids);

//   if (error) throw error;
//   return data;
// }

// export { enrichTeamsWithNames };

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

// Get total teams count
export async function getTeamsCount() {
  const { error, count } = await supabase
    .from("teams")
    .select("id", { count: "exact" });

  if (error) throw error;
  return count || 0;
}

// Get total matches count
export async function getMatchesCount() {
  const { error, count } = await supabase
    .from("matches")
    .select("id", { count: "exact" });

  if (error) throw error;
  return count || 0;
}

// Get next scheduled match
export async function getNextMatch() {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      home_team:teams!matches_home_team_id_fkey (name),
      away_team:teams!matches_away_team_id_fkey (name)
    `,
    )
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}
