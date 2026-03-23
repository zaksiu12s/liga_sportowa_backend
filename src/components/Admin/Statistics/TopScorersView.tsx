import { useState, useEffect } from "react";
import { topScorersApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";

interface TopScorer {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
  school: string;
}

export const TopScorersView = () => {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadTopScorers();
  }, []);

  const loadTopScorers = async () => {
    try {
      setLoading(true);

      // Fetch directly from top_scorers table (pre-calculated)
      const scorers = await topScorersApi.getAll();

      const mapped = scorers.map((scorer) => ({
        id: scorer.id,
        playerId: scorer.player_id,
        playerName: scorer.player_name,
        teamId: scorer.team_id,
        teamName: scorer.team_name,
        goals: scorer.goals,
        school: scorer.school,
      }));

      setTopScorers(mapped);
    } catch (error) {
      console.error("Failed to load top scorers:", error);
      showToast("Failed to load top scorers data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">Loading top scorers...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-black p-4">
        <button
          onClick={loadTopScorers}
          className="px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {topScorers.length === 0 ? (
        <div className="text-center py-8 border-2 border-black bg-white text-gray-500">
          No goal data yet. Complete some matches to see top scorers.
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black bg-white">
          <table className="w-full">
            <thead className="bg-black text-white border-b-2 border-black">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">
                  Position
                </th>
                <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">
                  Player
                </th>
                <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">
                  Team
                </th>
                <th className="px-4 py-2 text-left text-xs font-black uppercase tracking-widest">
                  School
                </th>
                <th className="px-4 py-2 text-center text-xs font-black uppercase tracking-widest">
                  Goals
                </th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, idx) => (
                <tr
                  key={scorer.id}
                  className={`border-b-2 border-black ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2 text-xs font-bold">#{idx + 1}</td>
                  <td className="px-4 py-2 text-xs font-bold">
                    {scorer.playerName}
                  </td>
                  <td className="px-4 py-2 text-xs">{scorer.teamName}</td>
                  <td className="px-4 py-2 text-xs uppercase">
                    {scorer.school}
                  </td>
                  <td className="px-4 py-2 text-center text-xs font-black text-lg">
                    {scorer.goals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topScorers.length > 0 && (
        <div className="text-xs text-gray-600 border-2 border-black bg-white p-4">
          <div className="font-bold mb-2">Summary:</div>
          <div>Total goal scorers: {topScorers.length}</div>
          <div>Total goals: {topScorers.reduce((sum, s) => sum + s.goals, 0)}</div>
          <div>
            Top scorer: {topScorers[0]?.playerName} ({topScorers[0]?.goals} goals)
          </div>
        </div>
      )}
    </div>
  );
};
