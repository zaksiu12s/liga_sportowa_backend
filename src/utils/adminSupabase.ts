import type {
  Team,
  Match,
  Player,
  StageGroup,
  TeamStats,
  FinalStageMatch,
  Subscriber,
  MailQueueItem,
} from "../types/admin";
import supabase from "./supabase";
import { generateRoundRobinMatches, MATCH_SCHEDULES } from "./matchGenerator";

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
    // Remove fields that don't exist in the database
    const { round, ...matchWithoutRound } = match;

    const { data, error } = await supabase
      .from("matches")
      .insert([matchWithoutRound])
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
    round: number,
    customScheduledAt?: string
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

    // Use custom scheduled time or get from defaults
    let scheduledAt: string;
    if (customScheduledAt) {
      scheduledAt = customScheduledAt;
    } else {
      const schedule = MATCH_SCHEDULES.find((s) => s.round === round);
      if (!schedule) throw new Error(`Schedule not found for round ${round}`);
      scheduledAt = new Date(schedule.date).toISOString();
    }
    const createdMatches: Match[] = [];
    let globalMatchIndex = 0; // Track position for 20-minute intervals

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
        stageName,
        globalMatchIndex // Pass current position for 20-minute scheduling
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
            .maybeSingle();

          if (existingMatch) {
            console.log(
              `Match already exists: ${match.home_team_id} vs ${match.away_team_id}`
            );
            continue;
          }

          const createdMatch = await matchesApi.create({
            ...match,
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

      // Update global index for next group
      globalMatchIndex += matchData.length;
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

      const teams = Array.isArray(group.teams?.teams) ? group.teams.teams : [];
      const standingsByTeamId = new Map<string, TeamStats>(
        teams.map((team: TeamStats) => [
          team.id,
          {
            ...team,
            points: 0,
            goals_for: 0,
            goals_against: 0,
          },
        ])
      );

      // Recalculate standings from all finished matches in this stage/group.
      const { data: finishedMatches, error: finishedMatchesError } = await (supabase as any)
        .from("matches")
        .select("home_team_id, away_team_id, score_home, score_away")
        .eq("stage", match.stage)
        .eq("group", match.group)
        .eq("status", "finished");

      if (finishedMatchesError) throw finishedMatchesError;

      for (const finishedMatch of finishedMatches || []) {
        const homeId = finishedMatch.home_team_id as string | null;
        const awayId = finishedMatch.away_team_id as string | null;
        const homeScore = Number(finishedMatch.score_home);
        const awayScore = Number(finishedMatch.score_away);

        if (!homeId || !awayId || !Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
          continue;
        }

        const homeStats = standingsByTeamId.get(homeId);
        const awayStats = standingsByTeamId.get(awayId);

        if (!homeStats || !awayStats) {
          continue;
        }

        homeStats.goals_for += homeScore;
        homeStats.goals_against += awayScore;
        awayStats.goals_for += awayScore;
        awayStats.goals_against += homeScore;

        if (homeScore > awayScore) {
          homeStats.points += 3;
        } else if (homeScore < awayScore) {
          awayStats.points += 3;
        } else {
          homeStats.points += 1;
          awayStats.points += 1;
        }
      }

      const updatedTeams = teams.map((team: TeamStats) => standingsByTeamId.get(team.id) || team);

      // Sort by points (desc) then by goal difference
      updatedTeams.sort((a: TeamStats, b: TeamStats) => {
        if (b.points !== a.points) return b.points - a.points;
        const aDiff = a.goals_for - a.goals_against;
        const bDiff = b.goals_for - b.goals_against;
        if (bDiff !== aDiff) return bDiff - aDiff;
        return b.goals_for - a.goals_for;
      });

      // Update group standings
      await (supabase as any)
        .from(match.stage)
        .update({ teams: { teams: updatedTeams } })
        .eq("id", group.id);
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
    awayTeamId: string,
    scheduledAt?: string
  ): Promise<FinalStageMatch> {
    if (homeTeamId === awayTeamId) {
      throw new Error("Home and away teams must be different");
    }

    const { data, error } = await (supabase as any)
      .from("final_stage")
      .insert([{
        type,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: scheduledAt || null
      }])
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
    awayTeamId: string,
    scheduledAt?: string
  ): Promise<FinalStageMatch> {
    if (homeTeamId === awayTeamId) {
      throw new Error("Home and away teams must be different");
    }

    const { data, error } = await (supabase as any)
      .from("final_stage")
      .update({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: scheduledAt || null
      })
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

// TOP SCORERS OPERATIONS
export const topScorersApi = {
  async getAll(): Promise<Array<{
    id: string;
    player_id: string;
    player_name: string;
    team_id: string;
    team_name: string;
    goals: number;
    school: string;
  }>> {
    const { data, error } = await (supabase as any)
      .from("top_scorers")
      .select("*")
      .order("goals", { ascending: false });

    if (error) throw error;
    return (data || []) as Array<{
      id: string;
      player_id: string;
      player_name: string;
      team_id: string;
      team_name: string;
      goals: number;
      school: string;
    }>;
  },
};

// NEWSLETTER OPERATIONS
export const newsletterApi = {
  getMailerBaseUrl(): string {
    const customUrl = import.meta.env.VITE_MAILER_FUNCTION_URL as string | undefined;
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.replace(/\/$/, "");
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!supabaseUrl) {
      throw new Error("Missing VITE_SUPABASE_URL environment variable");
    }

    return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/mailer`;
  },

  async getSubscribers(): Promise<Subscriber[]> {
    const { data, error } = await (supabase as any)
      .from("subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Subscriber[];
  },

  async getQueue(limit = 100): Promise<MailQueueItem[]> {
    const { data, error } = await (supabase as any)
      .from("mail_queue")
      .select("id, email, subject, html, status, retries, sent_at, opened_at, clicked_at, created_at, scheduled_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as MailQueueItem[];
  },

  async generateNewsletterContent(input: {
    provider: "groq" | "gemini";
    requestType: "report" | "promo" | "recap" | "announcement";
    logoAwareness?: boolean;
    logoUrl?: string;
  }): Promise<{
    html: string;
    subject: string;
    providerUsed: string;
    fallbackUsed: boolean;
    requestTypeUsed: "report" | "promo" | "recap" | "announcement";
    generatedAt: string | null;
  }> {
    const provider = input.provider;
    const requestType = input.requestType;

    const { data, error } = await supabase.functions.invoke("report-generator", {
      body: {
        provider,
        request_type: requestType,
        logo_awareness: Boolean(input.logoAwareness),
        logo_url: input.logoUrl,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to generate report");
    }

    const payload = (data || {}) as {
      html?: string;
      subject?: string;
      provider_used?: string;
      fallback_used?: boolean;
      request_type?: "report" | "promo" | "recap" | "announcement";
      generated_at?: string;
    };

    if (!payload.html || typeof payload.html !== "string") {
      throw new Error("Report generator returned empty HTML");
    }

    if (!payload.subject || typeof payload.subject !== "string") {
      throw new Error("Report generator returned empty subject");
    }

    return {
      html: payload.html,
      subject: payload.subject,
      providerUsed: payload.provider_used || provider,
      fallbackUsed: Boolean(payload.fallback_used),
      requestTypeUsed: payload.request_type || requestType,
      generatedAt: payload.generated_at || null,
    };
  },

  async enqueueToAllSubscribers(input: {
    subject: string;
    html: string;
    scheduledAt?: string;
  }): Promise<number> {
    const subject = input.subject.trim();
    const html = input.html.trim();

    if (!subject) {
      throw new Error("Subject is required");
    }

    if (!html) {
      throw new Error("HTML content is required");
    }

    const scheduledAtIso = input.scheduledAt
      ? new Date(input.scheduledAt).toISOString()
      : undefined;

    const functionUrl = `${newsletterApi.getMailerBaseUrl()}/enqueue`;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const authToken = accessToken || anonKey;

    const baseMailerUrl = newsletterApi.getMailerBaseUrl();
    const endpointCandidates = Array.from(
      new Set([
        functionUrl,
        baseMailerUrl,
      ])
    );

    const requestPayload = JSON.stringify({
      subject,
      html,
      ...(scheduledAtIso ? { scheduled_at: scheduledAtIso } : {}),
    });

    let lastEndpointError = "";

    for (const endpoint of endpointCandidates) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey ? { apikey: anonKey } : {}),
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: requestPayload,
      });

      if (response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          queued?: number;
          inserted?: number;
          sent?: number;
        };

        if (typeof payload.queued === "number") return payload.queued;
        if (typeof payload.inserted === "number") return payload.inserted;
        if (typeof payload.sent === "number") return payload.sent;

        const subscribers = await newsletterApi.getSubscribers();
        return subscribers.length;
      }

      const errorText = await response.text().catch(() => "Unknown enqueue error");
      lastEndpointError = `${endpoint} -> ${response.status}: ${errorText}`;

      // 401/403 suggests auth issue and next candidate likely won't help.
      if (response.status === 401 || response.status === 403) {
        break;
      }
    }

    // Fallback path for setups without /enqueue endpoint enabled.
    const subscribers = await newsletterApi.getSubscribers();
    if (subscribers.length === 0) {
      throw new Error(
        `Enqueue failed: ${lastEndpointError || "unknown endpoint error"}. No subscribers found for fallback queue insert.`
      );
    }

    const queueRows = subscribers.map((subscriber) => ({
      email: subscriber.email,
      subject,
      html,
      status: "pending",
      scheduled_at: scheduledAtIso || new Date().toISOString(),
    }));

    const { error } = await (supabase as any)
      .from("mail_queue")
      .insert(queueRows);

    if (error) throw error;
    return queueRows.length;
  },

  async updateScheduledQueueItem(input: {
    id: string;
    subject: string;
    html: string;
    scheduledAt: string;
  }): Promise<void> {
    const id = input.id.trim();
    const subject = input.subject.trim();
    const html = input.html.trim();

    if (!id) throw new Error("Queue item id is required");
    if (!subject) throw new Error("Subject is required");
    if (!html) throw new Error("HTML content is required");

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error("Invalid scheduled date");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const authToken = accessToken || anonKey;

    const updateEndpoint = `${newsletterApi.getMailerBaseUrl()}/update`;
    const updateResponse = await fetch(updateEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(anonKey ? { apikey: anonKey } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        id,
        subject,
        html,
        scheduled_at: scheduledAt.toISOString(),
      }),
    });

    if (updateResponse.ok) {
      return;
    }

    const { data: queueItem, error: fetchError } = await (supabase as any)
      .from("mail_queue")
      .select("id, status, sent_at")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!queueItem) throw new Error("Queue item not found");
    if (queueItem.status === "sent" || queueItem.sent_at) {
      throw new Error("Sent emails cannot be edited");
    }

    const { error: updateError } = await (supabase as any)
      .from("mail_queue")
      .update({
        subject,
        html,
        scheduled_at: scheduledAt.toISOString(),
        status: "pending",
      })
      .eq("id", id);

    if (updateError) throw updateError;
  },

  async deleteScheduledQueueItem(id: string): Promise<void> {
    const queueId = id.trim();
    if (!queueId) throw new Error("Queue item id is required");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const authToken = accessToken || anonKey;

    const deleteEndpoint = `${newsletterApi.getMailerBaseUrl()}/delete`;
    const deleteResponse = await fetch(deleteEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(anonKey ? { apikey: anonKey } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ id: queueId }),
    });

    if (deleteResponse.ok) {
      return;
    }

    const { data: queueItem, error: fetchError } = await (supabase as any)
      .from("mail_queue")
      .select("id, status, sent_at")
      .eq("id", queueId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!queueItem) throw new Error("Queue item not found");
    if (queueItem.status === "sent" || queueItem.sent_at) {
      throw new Error("Sent emails cannot be deleted");
    }

    const { error: deleteError } = await (supabase as any)
      .from("mail_queue")
      .delete()
      .eq("id", queueId);

    if (deleteError) throw deleteError;
  },
};
