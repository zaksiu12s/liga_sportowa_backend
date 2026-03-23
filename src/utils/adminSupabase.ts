import type { Team, Match } from "../types/admin";
import supabase from "./supabase";

// TEAMS OPERATIONS
export const teamsApi = {
  async getAll(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("points", { ascending: false });

    if (error) throw error;
    return (data || []) as Team[];
  },

  async create(team: Omit<Team, "id" | "created_at">): Promise<Team> {
    const { data, error } = await supabase
      .from("teams")
      .insert([team])
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  },

  async update(id: string, updates: Partial<Team>): Promise<Team> {
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Team;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  subscribe(callback: (teams: Team[]) => void) {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      teamsApi.getAll().then(callback).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  },
};

// MATCHES OPERATIONS
export const matchesApi = {
  async getAll(): Promise<Match[]> {
    const { data, error } = await supabase
      .from("matches")
      .select(
        "*, home_team:matches(home_team_id),away_team:matches(away_team_id)"
      )
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    // Fetch related teams separately
    if (!data) return [];

    const enrichedData: Match[] = [];
    for (const match of data) {
      const { data: homeTeam } = await supabase
        .from("teams")
        .select("*")
        .eq("id", match.home_team_id)
        .single();

      const { data: awayTeam } = await supabase
        .from("teams")
        .select("*")
        .eq("id", match.away_team_id)
        .single();

      enrichedData.push({
        ...match,
        home_team: homeTeam as Team || undefined,
        away_team: awayTeam as Team || undefined,
      } as Match);
    }

    return enrichedData;
  },

  async create(match: Omit<Match, "id" | "created_at">): Promise<Match> {
    const { data, error } = await supabase
      .from("matches")
      .insert([match])
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  },

  async update(id: string, updates: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  },

  async updateScore(
    id: string,
    homeScore: number,
    awayScore: number,
    status: "live" | "finished" = "finished"
  ): Promise<Match> {
    return matchesApi.update(id, {
      score_home: homeScore,
      score_away: awayScore,
      status,
    });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  subscribe(callback: (matches: Match[]) => void) {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      matchesApi.getAll().then(callback).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  },
};
