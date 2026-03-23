import { useState, useEffect } from "react";
import type { Match, Player } from "../../../types/admin";
import { useToast } from "../Toast";
import { playersApi } from "../../../utils/adminSupabase";

interface MatchResultFormProps {
  match: Match;
  onSubmit: (scoreHome: number, scoreAway: number, goalScorers?: { goals: Array<{ team_id: string; player_id: string; time: number }> }) => Promise<void>;
  onCancel: () => void;
}

interface GoalEntry {
  id: string;
  team_id: string;
  player_id: string;
  time: number;
}

export const MatchResultForm = ({
  match,
  onSubmit,
  onCancel,
}: MatchResultFormProps) => {
  const [scoreHome, setScoreHome] = useState(match.score_home ?? 0);
  const [scoreAway, setScoreAway] = useState(match.score_away ?? 0);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    loadPlayers();
    loadExistingGoals();
  }, [match.id, match.goal_scorers]);

  const loadExistingGoals = () => {
    // Load existing goals from match if they exist
    if (match.goal_scorers && match.goal_scorers.goals && Array.isArray(match.goal_scorers.goals)) {
      const existingGoals = match.goal_scorers.goals.map((goal: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        team_id: goal.team_id || "",
        player_id: goal.player_id || "",
        time: goal.time || 0,
      }));
      setGoals(existingGoals);
    }
  };

  const loadPlayers = async () => {
    try {
      const allPlayers = await playersApi.getAll();
      setPlayers(allPlayers);
    } catch (error) {
      console.error("Failed to load players:", error);
    }
  };

  const handleAddGoal = () => {
    setGoals([
      ...goals,
      {
        id: Math.random().toString(36).substr(2, 9),
        team_id: match.home_team_id || "",
        player_id: "",
        time: 0,
      },
    ]);
  };

  const handleRemoveGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
  };

  const handleGoalChange = (
    goalId: string,
    field: "team_id" | "player_id" | "time",
    value: string | number
  ) => {
    setGoals(
      goals.map((g) => (g.id === goalId ? { ...g, [field]: value } : g))
    );
  };

  const getTeamPlayers = (teamId: string) => {
    return players.filter((p) => p.team_id === teamId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all goals have required fields
    const invalidGoals = goals.filter(g => !g.team_id || !g.player_id);
    if (invalidGoals.length > 0) {
      showToast("All goals must have team and player selected", "error");
      return;
    }

    // Validate goal count matches score
    const homeGoals = goals.filter(g => g.team_id === match.home_team_id).length;
    const awayGoals = goals.filter(g => g.team_id === match.away_team_id).length;

    if (homeGoals !== scoreHome) {
      showToast(`Home team has ${homeGoals} goal scorers but score is ${scoreHome}`, "error");
      return;
    }

    if (awayGoals !== scoreAway) {
      showToast(`Away team has ${awayGoals} goal scorers but score is ${scoreAway}`, "error");
      return;
    }

    setLoading(true);
    try {
      const goalScorersData = {
        goals: goals.map((g) => ({
          team_id: g.team_id,
          player_id: g.player_id,
          time: Number(g.time),
        })),
      };

      console.log("Submitting match result:", {
        scoreHome,
        scoreAway,
        goalsCount: goals.length,
        goalScorersData
      });

      await onSubmit(scoreHome, scoreAway, goalScorersData);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to update score",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 border-2 border-black p-4 text-center space-y-2">
          <div className="font-black text-sm uppercase tracking-widest">Home</div>
          <div className="font-bold text-sm">{match.home_team?.name || "Home"}</div>
          <input
            type="number"
            min="0"
            max="99"
            value={scoreHome}
            onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border-2 border-black text-center font-black text-2xl"
            disabled={loading}
          />
        </div>

        <div className="flex items-end justify-center pb-4">
          <div className="text-center text-2xl font-black">vs</div>
        </div>

        <div className="bg-gray-50 border-2 border-black p-4 text-center space-y-2">
          <div className="font-black text-sm uppercase tracking-widest">Away</div>
          <div className="font-bold text-sm">{match.away_team?.name || "Away"}</div>
          <input
            type="number"
            min="0"
            max="99"
            value={scoreAway}
            onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border-2 border-black text-center font-black text-2xl"
            disabled={loading}
          />
        </div>
      </div>

      {/* Points Calculation */}
      <div className="bg-blue-50 border-2 border-blue-300 p-3 text-xs text-blue-900">
        <div className="font-black mb-2">POINTS CALCULATION:</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-bold">{match.home_team?.name || "Home"}:</span>{" "}
            {scoreHome > scoreAway
              ? "3 pts (Win)"
              : scoreHome === scoreAway
                ? "1 pt (Tie)"
                : "0 pts (Loss)"}
          </div>
          <div>
            <span className="font-bold">{match.away_team?.name || "Away"}:</span>{" "}
            {scoreAway > scoreHome
              ? "3 pts (Win)"
              : scoreAway === scoreHome
                ? "1 pt (Tie)"
                : "0 pts (Loss)"}
          </div>
        </div>
      </div>

      {/* Goal Scorers Section */}
      <div className="border-2 border-black p-4 space-y-3 bg-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest">
              Goal Scorers
            </h4>
            <div className="text-xs text-gray-600 mt-1">
              Total: <span className="font-bold">{goals.length}</span> {goals.length === 1 ? "goal" : "goals"}
            </div>
            <div className="text-xs mt-2 space-y-1">
              <div className={`${goals.filter(g => g.team_id === match.home_team_id).length === scoreHome ? "text-green-700" : "text-red-700"} font-bold`}>
                {match.home_team?.name || "Home"}: {goals.filter(g => g.team_id === match.home_team_id).length}/{scoreHome}
              </div>
              <div className={`${goals.filter(g => g.team_id === match.away_team_id).length === scoreAway ? "text-green-700" : "text-red-700"} font-bold`}>
                {match.away_team?.name || "Away"}: {goals.filter(g => g.team_id === match.away_team_id).length}/{scoreAway}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddGoal}
            disabled={loading}
            className="px-3 py-1 bg-black text-white border-2 border-black font-black text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
          >
            + ADD GOAL
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-xs text-gray-500 py-2 bg-white border-2 border-dashed border-gray-300 p-2 text-center">
            No goals added yet. Click "+ ADD GOAL" to record scorers.
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div key={goal.id} className="bg-white border-2 border-blue-300 p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-black text-xs uppercase">Goal {idx + 1}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(goal.id)}
                    disabled={loading}
                    className="w-6 h-6 flex items-center justify-center border-2 border-red-600 text-red-600 font-black text-xs hover:bg-red-600 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Team */}
                  <div>
                    <label className="block text-xs font-black uppercase mb-1">
                      Team *
                    </label>
                    <select
                      value={goal.team_id}
                      onChange={(e) =>
                        handleGoalChange(goal.id, "team_id", e.target.value)
                      }
                      className="w-full px-2 py-1 border-2 border-black text-xs font-bold bg-white"
                      disabled={loading}
                    >
                      <option value="">-- Select --</option>
                      <option value={match.home_team_id || ""}>
                        {match.home_team?.name || "Home"}
                      </option>
                      <option value={match.away_team_id || ""}>
                        {match.away_team?.name || "Away"}
                      </option>
                    </select>
                  </div>

                  {/* Player */}
                  <div>
                    <label className="block text-xs font-black uppercase mb-1">
                      Player *
                    </label>
                    <select
                      value={goal.player_id}
                      onChange={(e) =>
                        handleGoalChange(goal.id, "player_id", e.target.value)
                      }
                      className="w-full px-2 py-1 border-2 border-black text-xs bg-white"
                      disabled={loading || !goal.team_id}
                    >
                      <option value="">-- Select --</option>
                      {getTeamPlayers(goal.team_id).map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.first_name} {player.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-black uppercase mb-1">
                      Time (min) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={goal.time}
                      onChange={(e) =>
                        handleGoalChange(goal.id, "time", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 border-2 border-black text-xs text-center font-bold"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t-2 border-black">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-black text-white border-2 border-black font-black text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "SAVING..." : "SAVE RESULT"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 px-4 bg-white text-black border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};
