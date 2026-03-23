import { useState } from "react";
import type { Match } from "../../../types/admin";
import { useToast } from "../Toast";

interface MatchResultFormProps {
  match: Match;
  onSubmit: (scoreHome: number, scoreAway: number) => Promise<void>;
  onCancel: () => void;
}

export const MatchResultForm = ({
  match,
  onSubmit,
  onCancel,
}: MatchResultFormProps) => {
  const [scoreHome, setScoreHome] = useState(match.score_home ?? 0);
  const [scoreAway, setScoreAway] = useState(match.score_away ?? 0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(scoreHome, scoreAway);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border-2 border-black p-4 text-center space-y-2">
        <div className="font-bold text-lg">{match.home_team?.name || "Home"}</div>
        <input
          type="number"
          min="0"
          max="99"
          value={scoreHome}
          onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border-2 border-black text-center font-black text-2xl"
          disabled={loading}
        />
      </div>

      <div className="text-center text-xs font-black uppercase tracking-widest">
        vs
      </div>

      <div className="bg-gray-50 border-2 border-black p-4 text-center space-y-2">
        <div className="font-bold text-lg">{match.away_team?.name || "Away"}</div>
        <input
          type="number"
          min="0"
          max="99"
          value={scoreAway}
          onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border-2 border-black text-center font-black text-2xl"
          disabled={loading}
        />
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 p-3 text-xs text-blue-900">
        <div className="font-bold mb-1">Points Calculation:</div>
        <div>Home: {scoreHome > scoreAway ? "3 pts (Win)" : scoreHome === scoreAway ? "1 pt (Tie)" : "0 pts (Loss)"}</div>
        <div>Away: {scoreAway > scoreHome ? "3 pts (Win)" : scoreAway === scoreHome ? "1 pt (Tie)" : "0 pts (Loss)"}</div>
      </div>

      <div className="flex gap-2 pt-4">
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
