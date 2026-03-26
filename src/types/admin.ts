export interface AdminUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  role?: "admin" | "coordinator";
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface TeamStats {
  id: string;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface StageGroup {
  id: string;
  group_code: string;
  teams: {
    teams: TeamStats[];
  };
  created_at: string;
}

export interface StageType {
  name: "first_stage" | "second_stage" | "final_stage";
  label: string;
}

export type FinalMatchType = "semi-final-A" | "semi-final-B" | "final" | "3rd-place";

export interface FinalStageMatch {
  id: number;
  type: FinalMatchType;
  home_team_id: string;
  away_team_id: string;
  scheduled_at?: string | null;
  status?: "scheduled" | "live" | "finished";
  score_home?: number | null;
  score_away?: number | null;
  created_at: string;
  home_team?: Team;
  away_team?: Team;
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  class_code: string | null;
  team_id: string;
  school: string;
  created_at: string;
  team?: Team;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  score_home: number | null;
  score_away: number | null;
  status: "scheduled" | "live" | "finished";
  scheduled_at: string | null;
  stage: string | null;
  round?: number | null;
  group?: string | null;
  notes?: string | null;
  goal_scorers?: {
    goals: Array<{
      team_id: string;
      player_id: string;
      time: number;
    }>;
  } | null;
  created_at: string;
  updated_at?: string;
  home_team?: Team;
  away_team?: Team;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface MailQueueItem {
  id: string;
  email: string;
  subject: string;
  html: string;
  status: "pending" | "sent" | "failed" | string;
  retries: number;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
  scheduled_at: string | null;
}

export type AdminView =
  | "dashboard"
  | "teams"
  | "matches"
  | "players"
  | "stages"
  | "top-scorers"
  | "navigation"
  | "newsletter";

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

export interface FormError {
  field: string;
  message: string;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}
