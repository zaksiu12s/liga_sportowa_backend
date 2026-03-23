export interface AdminUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  role?: "admin" | "coordinator";
}

export interface Team {
  id: string;
  name: string;
  group: string | null;
  points: number;
  goals_for: number;
  goals_against: number;
  created_at: string;
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
  created_at: string;
  home_team?: Team;
  away_team?: Team;
}

export type AdminView =
  | "dashboard"
  | "teams"
  | "matches";

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
