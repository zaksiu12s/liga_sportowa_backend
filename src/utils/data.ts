import supabase from "./supabase";
// Teams with optional related data
export async function getTeams() {
  const { data, error } = await supabase
    .from("teams")
    .select("*, group")
    .order("name");

  if (error) throw error;
  return data;
}

// Standings joined with Team info (including group)
export async function getStandings() {
  const { data, error } = await supabase
    .from("standings")
    .select(
      `
      *,
      teams (
        name,
        short_name,
        logo_path,
        group
      )
    `,
    )
    .order("points", { ascending: false })
    .order("goal_diff", { ascending: false });

  if (error) throw error;
  return data;
}

// Matches with Team names
export async function getMatches() {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      home_team:teams!matches_home_team_id_fkey (name),
      away_team:teams!matches_away_team_id_fkey (name),
      rounds (name)
    `,
    )
    .order("scheduled_at", { ascending: true });

  if (error) throw error;
  return data;
}
