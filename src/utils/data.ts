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
