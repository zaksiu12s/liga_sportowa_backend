import supabase from "./supabase";

// Get all teams (this now acts as the standings data)
export async function getTeams() {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("points", { ascending: false })
    .order("goals_for", { ascending: false });

  if (error) throw error;
  return data;
}

// Get matches with home and away team names
export async function getMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey (name),
      away_team:teams!matches_away_team_id_fkey (name)
    `)
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
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey (name),
      away_team:teams!matches_away_team_id_fkey (name)
    `)
    .eq("status", "scheduled")
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

