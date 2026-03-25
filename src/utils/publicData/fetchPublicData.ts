import supabase from "../supabase";
import type {
  FetchPublicDataResult,
  PublicDataSnapshot,
  PublicMatch,
  PublicStageGroup,
} from "../../types/publicData";
import type { NavigationSetting } from "../../types/navigation";

const emptySnapshot = (): PublicDataSnapshot => ({
  teams: [],
  matches: [],
  players: [],
  firstStageGroups: [],
  secondStageGroups: [],
  finalStageMatches: [],
  topScorers: [],
  navigationSettings: [],
});

const toString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  return toString(value);
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

type SettledResult<T> = PromiseSettledResult<T>;

const collectWarnings = (
  label: string,
  settled: SettledResult<unknown>,
  warnings: string[]
) => {
  if (settled.status === "rejected") {
    const reason = settled.reason instanceof Error ? settled.reason.message : "unknown error";
    warnings.push(`${label}: ${reason}`);
  }
};

export const fetchPublicData = async (): Promise<FetchPublicDataResult> => {
  const warnings: string[] = [];

  const [
    teamsResult,
    matchesResult,
    playersResult,
    firstStageResult,
    secondStageResult,
    finalStageResult,
    topScorersResult,
    navigationResult,
  ] = await Promise.allSettled([
    supabase
      .from("teams")
      .select("*"),
    (supabase as any)
      .from("matches")
      .select("*")
      .order("scheduled_at", { ascending: true }),
    (supabase as any)
      .from("players")
      .select("*"),
    (supabase as any)
      .from("first_stage")
      .select("id, group_code, teams")
      .order("group_code", { ascending: true }),
    (supabase as any)
      .from("second_stage")
      .select("id, group_code, teams")
      .order("group_code", { ascending: true }),
    (supabase as any)
      .from("final_stage")
      .select("*")
      .order("type", { ascending: true }),
    (supabase as any)
      .from("top_scorers")
      .select("*")
      .order("goals", { ascending: false })
      .limit(10),
    (supabase as any)
      .from("navigation_settings")
      .select("path, label, is_hidden, updated_at"),
  ]);

  const getTableError = (result: PromiseSettledResult<{ data: unknown; error: { message: string } | null }>) => {
    if (result.status !== "fulfilled") return "request failed";
    return result.value.error ? result.value.error.message : null;
  };

  const coreErrors = [
    { name: "teams", error: getTableError(teamsResult as any) },
    { name: "matches", error: getTableError(matchesResult as any) },
    { name: "players", error: getTableError(playersResult as any) },
  ];

  const hasCoreSuccess = coreErrors.some((entry) => !entry.error);

  if (!hasCoreSuccess) {
    const details = coreErrors
      .map((entry) => `${entry.name}: ${entry.error || "unknown"}`)
      .join(" | ");
    throw new Error(`Core tables unavailable. ${details}`);
  }

  const snapshot = emptySnapshot();

  if (teamsResult.status === "fulfilled") {
    const { data, error } = teamsResult.value;
    if (error) {
      warnings.push(`teams: ${error.message}`);
    } else {
      snapshot.teams = ((data || []) as any[])
        .map((row) => ({
          id: toString(row.id),
          name: toString(row.name || "NIEZNANA"),
          points: toNumber(row.points),
          goals_for: toNumber(row.goals_for),
          goals_against: toNumber(row.goals_against),
        }))
        .filter((row) => Boolean(row.id));
    }
  } else {
    collectWarnings("teams", teamsResult, warnings);
  }

  if (matchesResult.status === "fulfilled") {
    const { data, error } = matchesResult.value;
    if (error) {
      warnings.push(`matches: ${error.message}`);
    } else {
      snapshot.matches = ((data || []) as any[])
        .map((row) => ({
          id: toString(row.id),
          stage: toNullableString(row.stage),
          group: toNullableString(row.group),
          round: toNullableNumber(row.round),
          status: toNullableString(row.status),
          scheduled_at: toNullableString(row.scheduled_at),
          home_team_id: toNullableString(row.home_team_id),
          away_team_id: toNullableString(row.away_team_id),
          score_home: toNullableNumber(row.score_home),
          score_away: toNullableNumber(row.score_away),
          goal_scorers: isObject(row.goal_scorers) ? row.goal_scorers as PublicMatch["goal_scorers"] : null,
          home_team: null,
          away_team: null,
        }))
        .filter((row) => Boolean(row.id));
    }
  } else {
    collectWarnings("matches", matchesResult, warnings);
  }

  if (playersResult.status === "fulfilled") {
    const { data, error } = playersResult.value;
    if (error) {
      warnings.push(`players: ${error.message}`);
    } else {
      snapshot.players = ((data || []) as any[])
        .map((row) => ({
          id: toString(row.id),
          first_name: toString(row.first_name),
          last_name: toString(row.last_name),
          class_code: toString(row.class_code ?? row.class ?? ""),
          school: toString(row.school ?? ""),
          team_id: toNullableString(row.team_id),
        }))
        .filter((row) => Boolean(row.id));
    }
  } else {
    collectWarnings("players", playersResult, warnings);
  }

  if (firstStageResult.status === "fulfilled") {
    const { data, error } = firstStageResult.value;
    if (error) {
      warnings.push(`first_stage: ${error.message}`);
    } else {
      snapshot.firstStageGroups = ((data || []) as any[]).map((row) => {
        const rawTeams = Array.isArray(row.teams?.teams) ? row.teams.teams : [];

        return {
          id: toString(row.id),
          group_code: toNullableString(row.group_code),
          teams: {
            teams: rawTeams
              .map((team: any) => ({
                id: toString(team.id),
                points: toNumber(team.points),
                goals_for: toNumber(team.goals_for),
                goals_against: toNumber(team.goals_against),
              }))
              .filter((team: any) => Boolean(team.id)),
          },
        } as PublicStageGroup;
      });
    }
  } else {
    collectWarnings("first_stage", firstStageResult, warnings);
  }

  if (secondStageResult.status === "fulfilled") {
    const { data, error } = secondStageResult.value;
    if (error) {
      warnings.push(`second_stage: ${error.message}`);
    } else {
      snapshot.secondStageGroups = ((data || []) as any[]).map((row) => {
        const rawTeams = Array.isArray(row.teams?.teams) ? row.teams.teams : [];

        return {
          id: toString(row.id),
          group_code: toNullableString(row.group_code),
          teams: {
            teams: rawTeams
              .map((team: any) => ({
                id: toString(team.id),
                points: toNumber(team.points),
                goals_for: toNumber(team.goals_for),
                goals_against: toNumber(team.goals_against),
              }))
              .filter((team: any) => Boolean(team.id)),
          },
        } as PublicStageGroup;
      });
    }
  } else {
    collectWarnings("second_stage", secondStageResult, warnings);
  }

  if (finalStageResult.status === "fulfilled") {
    const { data, error } = finalStageResult.value;
    if (error) {
      warnings.push(`final_stage: ${error.message}`);
    } else {
      snapshot.finalStageMatches = ((data || []) as any[])
        .map((row) => ({
          id: toString(row.id),
          type: toNullableString(row.type),
          home_team_id: toNullableString(row.home_team_id),
          away_team_id: toNullableString(row.away_team_id),
          score_home: toNullableNumber(row.score_home),
          score_away: toNullableNumber(row.score_away),
          home_team: null,
          away_team: null,
        }))
        .filter((row) => Boolean(row.id));
    }
  } else {
    collectWarnings("final_stage", finalStageResult, warnings);
  }

  if (topScorersResult.status === "fulfilled") {
    const { data, error } = topScorersResult.value;
    if (error) {
      warnings.push(`top_scorers: ${error.message}`);
    } else {
      snapshot.topScorers = ((data || []) as any[])
        .map((row) => ({
          id: toString(row.id),
          player_id: toString(row.player_id),
          player_name: toString(row.player_name),
          team_id: toString(row.team_id),
          team_name: toString(row.team_name),
          goals: toNumber(row.goals),
        }))
        .filter((row) => Boolean(row.id));
    }
  } else {
    collectWarnings("top_scorers", topScorersResult, warnings);
  }

  if (navigationResult.status === "fulfilled") {
    const { data, error } = navigationResult.value;
    if (error) {
      warnings.push(`navigation_settings: ${error.message}`);
    } else {
      snapshot.navigationSettings = ((data || []) as any[])
        .map((row) => ({
          path: toString(row.path),
          label: toString(row.label),
          is_hidden: Boolean(row.is_hidden),
          updated_at: toNullableString(row.updated_at) || undefined,
        }))
        .filter((row) => Boolean(row.path)) as NavigationSetting[];
    }
  } else {
    collectWarnings("navigation_settings", navigationResult, warnings);
  }

  const teamsById = new Map(snapshot.teams.map((team) => [team.id, team.name]));

  snapshot.matches = snapshot.matches.map((match) => ({
    ...match,
    home_team: match.home_team || (match.home_team_id ? { name: teamsById.get(match.home_team_id) || "NIEZNANA" } : null),
    away_team: match.away_team || (match.away_team_id ? { name: teamsById.get(match.away_team_id) || "NIEZNANA" } : null),
  }));

  snapshot.finalStageMatches = snapshot.finalStageMatches.map((match) => ({
    ...match,
    home_team: match.home_team || (match.home_team_id ? { name: teamsById.get(match.home_team_id) || "NIEZNANA" } : null),
    away_team: match.away_team || (match.away_team_id ? { name: teamsById.get(match.away_team_id) || "NIEZNANA" } : null),
  }));

  const hasNoCoreData =
    snapshot.teams.length === 0 &&
    snapshot.matches.length === 0 &&
    snapshot.players.length === 0;

  if (hasNoCoreData && warnings.length > 0) {
    throw new Error(`Bundle returned empty core data with warnings: ${warnings.join(" | ")}`);
  }

  return {
    snapshot,
    fetchedAt: new Date().toISOString(),
    warnings,
  };
};
