// Match generation and points calculation utilities

export interface MatchSchedule {
  round: number;
  date: Date;
  timeStart: string;
  timeEnd: string;
}

export const MATCH_SCHEDULES: MatchSchedule[] = [
  { round: 1, date: new Date(Date.UTC(2026, 3, 16)), timeStart: "17:00", timeEnd: "20:00" },
  { round: 2, date: new Date(Date.UTC(2026, 3, 23)), timeStart: "17:00", timeEnd: "20:00" },
  { round: 3, date: new Date(Date.UTC(2026, 3, 30)), timeStart: "17:00", timeEnd: "20:00" },
  { round: 4, date: new Date(Date.UTC(2026, 4, 21)), timeStart: "17:00", timeEnd: "20:00" },
  { round: 5, date: new Date(Date.UTC(2026, 4, 28)), timeStart: "17:00", timeEnd: "18:30" },
  { round: 6, date: new Date(Date.UTC(2026, 5, 11)), timeStart: "17:00", timeEnd: "18:30" },
];

export interface FinalMatchSchedule {
  type: string;
  date: Date;
  timeStart: string;
  timeEnd: string;
  name: string;
}

export const FINALS_SCHEDULES: FinalMatchSchedule[] = [
  { type: "semi-final-a", date: new Date(Date.UTC(2026, 5, 22)), timeStart: "08:00", timeEnd: "08:20", name: "Semi-Final A" },
  { type: "semi-final-b", date: new Date(Date.UTC(2026, 5, 22)), timeStart: "08:20", timeEnd: "08:40", name: "Semi-Final B" },
  { type: "3rd-place", date: new Date(Date.UTC(2026, 5, 23)), timeStart: "09:00", timeEnd: "09:20", name: "3rd Place Match" },
  { type: "final", date: new Date(Date.UTC(2026, 5, 23)), timeStart: "09:20", timeEnd: "09:40", name: "Final" },
];

/**
 * Generate round-robin matches for a group with proper league scheduling
 * Each match is 20 minutes long, scheduled sequentially (no overlaps)
 * Spreads matches across stage rounds; for 5-team groups in first stage it uses 3-3-2-2
 */
export function generateRoundRobinMatches(
  teamIds: string[],
  group: string,
  round: number,
  scheduledAtBase: string,
  stage: "first_stage" | "second_stage" = "first_stage",
  matchIndexOffset = 0
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

  let startIndex = 0;
  let endIndex = 0;

  if (stage === "first_stage" && n === 5) {
    const roundDistribution = [3, 3, 2, 2];
    if (round < 1 || round > roundDistribution.length) {
      return matches;
    }

    startIndex = roundDistribution
      .slice(0, round - 1)
      .reduce((sum, value) => sum + value, 0);
    endIndex = Math.min(startIndex + roundDistribution[round - 1], allPairings.length);
  } else {
    const matchesPerRound = Math.max(2, Math.floor(n / 2));
    startIndex = (round - 1) * matchesPerRound;
    endIndex = Math.min(startIndex + matchesPerRound, allPairings.length);
  }

  // Add matches for this round
  let matchCount = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const [team1, team2] = allPairings[i];

    // Calculate time: each match is 20 minutes apart
    const baseDate = new Date(scheduledAtBase);
    const matchIndex = matchIndexOffset + matchCount;
    const minutesOffset = matchIndex * 20;
    const matchTime = new Date(baseDate.getTime() + minutesOffset * 60000);
    const scheduledAt = matchTime.toISOString();

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

    matchCount++;
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
    ...currentStats,
    points: currentStats.points + pointsToAdd,
    goals_for: currentStats.goals_for + scoreTeam,
    goals_against: currentStats.goals_against + scoreOpponent,
  };
}
