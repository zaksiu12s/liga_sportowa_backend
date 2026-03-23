import type { Team, Match, Player, StageGroup, TeamStats, FinalStageMatch } from "../types/admin";
import supabase from "./supabase";
import { generateRoundRobinMatches, updateTeamStats, MATCH_SCHEDULES } from "./matchGenerator";

// TEAMS OPERATIONS
export const teamsApi = {
  async getAll(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

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
    const interval = setInterval(() => {
      teamsApi.getAll().then(callback).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  },
};

// STAGES OPERATIONS
export const stagesApi = {
  async getGroupsByStage(stageName: "first_stage" | "second_stage"): Promise<StageGroup[]> {
    const { data, error } = await (supabase as any)
      .from(stageName)
      .select("*")
      .order("group_code", { ascending: true });

    if (error) throw error;
    return (data || []) as StageGroup[];
  },

  async createGroup(
    stageName: "first_stage" | "second_stage",
    groupCode: string
  ): Promise<StageGroup> {
    const { data, error } = await (supabase as any)
      .from(stageName)
      .insert([{ group_code: groupCode, teams: { teams: [] } }])
      .select()
      .single();

    if (error) throw error;
    return data as StageGroup;
  },

  async updateGroupCode(
    stageName: "first_stage" | "second_stage",
    id: string,
    newGroupCode: string
  ): Promise<StageGroup> {
    const { data, error } = await (supabase as any)
      .from(stageName)
      .update({ group_code: newGroupCode })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as StageGroup;
  },

  async deleteGroup(
    stageName: "first_stage" | "second_stage",
    id: string
  ): Promise<void> {
    const { error } = await (supabase as any)
      .from(stageName)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async addTeamToGroup(
    stageName: "first_stage" | "second_stage",
    groupId: string,
    teamId: string
  ): Promise<StageGroup> {
    // Get current group
    const { data: group, error: fetchError } = await (supabase as any)
      .from(stageName)
      .select("*")
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;

    // Add team to teams array
    const currentTeams = group.teams?.teams || [];
    const newTeam: TeamStats = {
      id: teamId,
      goals_for: 0,
      goals_against: 0,
      points: 0,
    };

    // Check if team already exists
    if (currentTeams.find((t: TeamStats) => t.id === teamId)) {
      throw new Error("Team already in group");
    }

    const updatedTeams = [...currentTeams, newTeam];

    // Update group
    const { data: updated, error: updateError } = await (supabase as any)
      .from(stageName)
      .update({ teams: { teams: updatedTeams } })
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated as StageGroup;
  },

  async removeTeamFromGroup(
    stageName: "first_stage" | "second_stage",
    groupId: string,
    teamId: string
  ): Promise<StageGroup> {
    // Get current group
    const { data: group, error: fetchError } = await (supabase as any)
      .from(stageName)
      .select("*")
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;

    // Remove team from teams array
    const currentTeams = group.teams?.teams || [];
    const updatedTeams = currentTeams.filter((t: TeamStats) => t.id !== teamId);

    // Update group
    const { data: updated, error: updateError } = await (supabase as any)
      .from(stageName)
      .update({ teams: { teams: updatedTeams } })
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated as StageGroup;
  },

  async updateTeamStats(
    stageName: "first_stage" | "second_stage",
    groupId: string,
    teamId: string,
    points: number,
    goalsFor: number,
    goalsAgainst: number
  ): Promise<StageGroup> {
    // Get current group
    const { data: group, error: fetchError } = await (supabase as any)
      .from(stageName)
      .select("*")
      .eq("id", groupId)
      .single();

    if (fetchError) throw fetchError;

    // Update team stats
    const currentTeams = group.teams?.teams || [];
    const updatedTeams = currentTeams.map((t: TeamStats) =>
      t.id === teamId
        ? { ...t, points, goals_for: goalsFor, goals_against: goalsAgainst }
        : t
    );

    // Update group
    const { data: updated, error: updateError } = await (supabase as any)
      .from(stageName)
      .update({ teams: { teams: updatedTeams } })
      .eq("id", groupId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated as StageGroup;
  },
};

// MATCHES OPERATIONS
export const matchesApi = {
  async getAll(): Promise<Match[]> {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
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

    if (error) {
      console.error("Create match error:", error);
      throw new Error(
        `Failed to create match: ${error.message || "Unknown error"}`
      );
    }
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

  async generateRoundRobinMatches(
    stageName: "first_stage" | "second_stage",
    round: number
  ): Promise<Match[]> {
    // Get all groups for the stage
    const { data: groups, error: groupsError } = await (supabase as any)
      .from(stageName)
      .select("*")
      .order("group_code", { ascending: true });

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      throw new Error(`Failed to fetch groups: ${groupsError.message}`);
    }

    console.log(`Found ${groups?.length || 0} groups for ${stageName}`);

    const schedule = MATCH_SCHEDULES.find((s) => s.round === round);
    if (!schedule) throw new Error(`Schedule not found for round ${round}`);

    const scheduledAt = new Date(schedule.date).toISOString();
    const createdMatches: Match[] = [];

    for (const group of groups || []) {
      const teamIds = group.teams?.teams?.map((t: TeamStats) => t.id) || [];
      console.log(`Group ${group.group_code}: ${teamIds.length} teams`, teamIds);

      if (teamIds.length < 2) {
        console.warn(`Group ${group.group_code} has less than 2 teams, skipping`);
        continue;
      }

      const matchData = generateRoundRobinMatches(
        teamIds,
        group.group_code,
        round,
        scheduledAt,
        stageName
      );

      console.log(`Generated ${matchData.length} matches for group ${group.group_code}`);

      for (const match of matchData) {
        try {
          // Check if match already exists
          const { data: existingMatch } = await supabase
            .from("matches")
            .select("id")
            .eq("home_team_id", match.home_team_id)
            .eq("away_team_id", match.away_team_id)
            .eq("group", match.group)
            .eq("stage", match.stage)
            .single();

          if (existingMatch) {
            console.log(
              `Match already exists: ${match.home_team_id} vs ${match.away_team_id}`
            );
            continue;
          }

          // Don't send round field - column doesn't exist in DB
          const { round: _, ...matchWithoutRound } = match;

          const createdMatch = await matchesApi.create({
            ...matchWithoutRound,
            score_home: null,
            score_away: null,
          });
          createdMatches.push(createdMatch);
        } catch (error) {
          console.error(
            `Failed to create match: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    console.log(`Total matches created: ${createdMatches.length}`);
    return createdMatches;
  },

  async updateMatchScore(
    matchId: string,
    scoreHome: number,
    scoreAway: number,
    goalScorers?: { goals: Array<{ team_id: string; player_id: string; time: number }> }
  ): Promise<Match> {
    // Get match details
    const { data: match, error: matchError } = await (supabase as any)
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError) throw matchError;

    // Update match
    const { data: updatedMatch, error: updateError } = await supabase
      .from("matches")
      .update({
        score_home: scoreHome,
        score_away: scoreAway,
        status: "finished",
        goal_scorers: goalScorers || { goals: [] },
      })
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update group standings if match is in first or second stage
    if (
      (match.stage === "first_stage" || match.stage === "second_stage") &&
      match.group
    ) {
      // Get group
      const { data: group, error: groupError } = await (supabase as any)
        .from(match.stage)
        .select("*")
        .eq("group_code", match.group)
        .single();

      if (groupError) throw groupError;

      const teams = group.teams?.teams || [];

      // Find and update team stats
      const updatedTeams = teams.map((team: TeamStats) => {
        if (team.id === match.home_team_id) {
          return updateTeamStats(
            team,
            scoreHome,
            scoreAway,
            true
          );
        } else if (team.id === match.away_team_id) {
          return updateTeamStats(
            team,
            scoreAway,
            scoreHome,
            false
          );
        }
        return team;
      });

      // Sort by points (desc) then by goal difference
      updatedTeams.sort((a: TeamStats, b: TeamStats) => {
        if (b.points !== a.points) return b.points - a.points;
        const aDiff = a.goals_for - a.goals_against;
        const bDiff = b.goals_for - b.goals_against;
        return bDiff - aDiff;
      });

      // Update group standings
      await (supabase as any)
        .from(match.stage)
        .update({ teams: { teams: updatedTeams } })
        .eq("id", match.group);
    }

    return updatedMatch as Match;
  },

  async getByRound(
    round: number,
    stageName?: "first_stage" | "second_stage"
  ): Promise<Match[]> {
    let query = supabase.from("matches").select("*").eq("round", round);

    if (stageName) {
      query = query.eq("stage", stageName);
    }

    const { data, error } = await query.order("scheduled_at", {
      ascending: true,
    });

    if (error) throw error;

    // Enrich with team data
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

  async getByGroupAndStage(
    group: string,
    stageName: "first_stage" | "second_stage" | "final_stage"
  ): Promise<Match[]> {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("group", group)
        .eq("stage", stageName)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Query error:", error);
        throw error;
      }

      // Enrich with team data
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
    } catch (error) {
      console.error("getByGroupAndStage error:", error);
      throw error;
    }
  },
};

// PLAYERS OPERATIONS
export const playersApi = {
  async getAll(): Promise<Player[]> {
    const { data, error } = await (supabase as any)
      .from("players")
      .select("*, team:team_id(*)");

    if (error) throw error;
    return (data || []) as Player[];
  },

  async getByTeam(teamId: string): Promise<Player[]> {
    const { data, error } = await (supabase as any)
      .from("players")
      .select("*, team:team_id(*)")
      .eq("team_id", teamId)
      .order("last_name", { ascending: true });

    if (error) throw error;
    return (data || []) as Player[];
  },

  async create(player: Omit<Player, "id" | "created_at">): Promise<Player> {
    const { data, error } = await (supabase as any)
      .from("players")
      .insert([player])
      .select("*, team:team_id(*)")
      .single();

    if (error) throw error;
    return data as Player;
  },

  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const { data, error } = await (supabase as any)
      .from("players")
      .update(updates)
      .eq("id", id)
      .select("*, team:team_id(*)")
      .single();

    if (error) throw error;
    return data as Player;
  },

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  subscribe(callback: (players: Player[]) => void) {
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      playersApi.getAll().then(callback).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  },
};

// FINAL STAGE OPERATIONS
export const finalStageApi = {
  async getAll(): Promise<FinalStageMatch[]> {
    const { data, error } = await (supabase as any)
      .from("final_stage")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich with team data
    if (!data) return [];

    const enrichedData: FinalStageMatch[] = [];
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
      } as FinalStageMatch);
    }

    return enrichedData;
  },

  async getByType(type: string): Promise<FinalStageMatch[]> {
    const { data, error } = await (supabase as any)
      .from("final_stage")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Enrich with team data
    if (!data) return [];

    const enrichedData: FinalStageMatch[] = [];
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
      } as FinalStageMatch);
    }

    return enrichedData;
  },

  async create(
    type: string,
    homeTeamId: string,
    awayTeamId: string
  ): Promise<FinalStageMatch> {
    if (homeTeamId === awayTeamId) {
      throw new Error("Home and away teams must be different");
    }

    const { data, error } = await (supabase as any)
      .from("final_stage")
      .insert([{ type, home_team_id: homeTeamId, away_team_id: awayTeamId }])
      .select()
      .single();

    if (error) throw error;

    // Enrich with team data
    const { data: homeTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", homeTeamId)
      .single();

    const { data: awayTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", awayTeamId)
      .single();

    return {
      ...data,
      home_team: homeTeam as Team || undefined,
      away_team: awayTeam as Team || undefined,
    } as FinalStageMatch;
  },

  async update(
    id: number,
    homeTeamId: string,
    awayTeamId: string
  ): Promise<FinalStageMatch> {
    if (homeTeamId === awayTeamId) {
      throw new Error("Home and away teams must be different");
    }

    const { data, error } = await (supabase as any)
      .from("final_stage")
      .update({ home_team_id: homeTeamId, away_team_id: awayTeamId })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Enrich with team data
    const { data: homeTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", homeTeamId)
      .single();

    const { data: awayTeam } = await supabase
      .from("teams")
      .select("*")
      .eq("id", awayTeamId)
      .single();

    return {
      ...data,
      home_team: homeTeam as Team || undefined,
      away_team: awayTeam as Team || undefined,
    } as FinalStageMatch;
  },

  async delete(id: number): Promise<void> {
    const { error } = await (supabase as any)
      .from("final_stage")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  subscribe(callback: (matches: FinalStageMatch[]) => void) {
    const interval = setInterval(() => {
      finalStageApi.getAll().then(callback).catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  },
};
