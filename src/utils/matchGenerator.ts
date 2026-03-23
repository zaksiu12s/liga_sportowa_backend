// Match generation and points calculation utilities

export interface MatchSchedule {
  round: number;
  date: Date;
  timeStart: string;
  timeEnd: string;
}

export const MATCH_SCHEDULES: MatchSchedule[] = [
  { round: 1, date: new Date(2024, 3, 16), timeStart: "17:00", timeEnd: "20:00" },
  { round: 2, date: new Date(2024, 3, 23), timeStart: "17:00", timeEnd: "20:00" },
  { round: 3, date: new Date(2024, 3, 30), timeStart: "17:00", timeEnd: "20:00" },
  { round: 4, date: new Date(2024, 4, 21), timeStart: "17:00", timeEnd: "20:00" },
  { round: 5, date: new Date(2024, 4, 28), timeStart: "17:00", timeEnd: "18:30" },
  { round: 6, date: new Date(2024, 5, 11), timeStart: "17:00", timeEnd: "18:30" },
];

/**
 * Generate round-robin matches for a group with proper league scheduling
 * Spreads matches across multiple rounds (max 2 matches per round)
 * Each team plays every other team once, but spread across multiple rounds
 */
export function generateRoundRobinMatches(
  teamIds: string[],
  group: string,
  round: number,
  scheduledAt: string,
  stage: "first_stage" | "second_stage" = "first_stage"
): Array<{
  home_team_id: string;
  away_team_id: string;
  round: number;
  group: string;
  scheduled_at: string;
  status: "scheduled";
  stage: string;
}> {
  const matches: Array<{
    home_team_id: string;
    away_team_id: string;
    round: number;
    group: string;
    scheduled_at: string;
    status: "scheduled";
    stage: string;
  }> = [];

  const n = teamIds.length;
  if (n < 2) return matches;

  // Generate all possible pairings
  const allPairings: Array<[string, string]> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairings.push([teamIds[i], teamIds[j]]);
    }
  }

  // Calculate matches per round (max 2 matches to ensure no team plays twice)
  const matchesPerRound = Math.max(2, Math.floor(n / 2));
  const startIndex = (round - 1) * matchesPerRound;
  const endIndex = Math.min(startIndex + matchesPerRound, allPairings.length);

  // Add matches for this round
  for (let i = startIndex; i < endIndex; i++) {
    const [team1, team2] = allPairings[i];

    // Alternate home/away for balance
    if (i % 2 === 0) {
      matches.push({
        home_team_id: team1,
        away_team_id: team2,
        round,
        group: group,
        scheduled_at: scheduledAt,
        status: "scheduled",
        stage: stage,
      });
    } else {
      matches.push({
        home_team_id: team2,
        away_team_id: team1,
        round,
        group: group,
        scheduled_at: scheduledAt,
        status: "scheduled",
        stage: stage,
      });
    }
  }

  return matches;
}

/**
 * Calculate points based on match result
 * 3 points for win, 1 for tie, 0 for loss
 */
export function calculateMatchPoints(
  scoreHome: number,
  scoreAway: number
): { homePoints: number; awayPoints: number } {
  if (scoreHome > scoreAway) {
    return { homePoints: 3, awayPoints: 0 };
  } else if (scoreHome < scoreAway) {
    return { homePoints: 0, awayPoints: 3 };
  } else {
    return { homePoints: 1, awayPoints: 1 };
  }
}

/**
 * Update team stats based on match result
 */
export function updateTeamStats(
  currentStats: { points: number; goals_for: number; goals_against: number },
  scoreTeam: number,
  scoreOpponent: number,
  isHomeTeam: boolean
): { points: number; goals_for: number; goals_against: number } {
  const { homePoints, awayPoints } = calculateMatchPoints(scoreTeam, scoreOpponent);
  const pointsToAdd = isHomeTeam ? homePoints : awayPoints;

  return {
    points: currentStats.points + pointsToAdd,
    goals_for: currentStats.goals_for + scoreTeam,
    goals_against: currentStats.goals_against + scoreOpponent,
  };
}
