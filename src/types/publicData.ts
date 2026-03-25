import type { NavigationSetting } from "./navigation";

export interface PublicTeam {
  id: string;
  name: string;
  points: number;
  goals_for: number;
  goals_against: number;
}

export interface PublicMatch {
  id: string;
  stage: string | null;
  group: string | null;
  round: number | null;
  status: string | null;
  scheduled_at: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  score_home: number | null;
  score_away: number | null;
  goal_scorers?: {
    goals?: Array<{
      time: number;
      team_id: string;
      player_id: string;
    }>;
  } | null;
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
}

export interface PublicPlayer {
  id: string;
  first_name: string;
  last_name: string;
  class_code: string;
  school: string;
  team_id: string | null;
}

export interface PublicStageGroup {
  id: string;
  group_code: string | null;
  teams?: {
    teams?: Array<{
      id: string;
      points: number;
      goals_for: number;
      goals_against: number;
    }>;
  } | null;
}

export interface PublicFinalStageMatch {
  id: string;
  type: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  score_home: number | null;
  score_away: number | null;
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
}

export interface PublicTopScorer {
  id: string;
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  goals: number;
}

export interface PublicDataSnapshot {
  teams: PublicTeam[];
  matches: PublicMatch[];
  players: PublicPlayer[];
  firstStageGroups: PublicStageGroup[];
  secondStageGroups: PublicStageGroup[];
  finalStageMatches: PublicFinalStageMatch[];
  topScorers: PublicTopScorer[];
  navigationSettings: NavigationSetting[];
}

export interface FetchPublicDataResult {
  snapshot: PublicDataSnapshot;
  fetchedAt: string;
  warnings: string[];
}

export interface PublicDataEnvelope {
  version: number;
  fetchedAt: string;
  hash: string;
  data: PublicDataSnapshot;
}
