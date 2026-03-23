import { useState } from "react";
import type { FinalStageMatch, FinalMatchType, Team } from "../../../types/admin";
import { useToast } from "../Toast";

interface FinalMatchFormProps {
  match?: FinalStageMatch;
  allTeams: Team[];
  selectedType: FinalMatchType;
  onSubmit: (data: { type: string; homeTeamId: string; awayTeamId: string }) => Promise<void>;
  onCancel: () => void;
}

export const FinalMatchForm = ({
  match,
  allTeams,
  selectedType,
  onSubmit,
  onCancel,
}: FinalMatchFormProps) => {
  const [homeTeamId, setHomeTeamId] = useState(match?.home_team_id || "");
  const [awayTeamId, setAwayTeamId] = useState(match?.away_team_id || "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeTeamId || !awayTeamId) {
      showToast("Both teams are required", "error");
      return;
    }

    if (homeTeamId === awayTeamId) {
      showToast("Teams must be different", "error");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type: selectedType,
        homeTeamId,
        awayTeamId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest mb-2">
          Home Team *
        </label>
        <select
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.target.value)}
          className="w-full px-3 py-2 border-2 border-black"
          required
          disabled={loading}
        >
          <option value="">Select team</option>
          {allTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest mb-2">
          Away Team *
        </label>
        <select
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.target.value)}
          className="w-full px-3 py-2 border-2 border-black"
          required
          disabled={loading}
        >
          <option value="">Select team</option>
          {allTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-black text-white border-2 border-black font-black text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "SAVING..." : match ? "UPDATE" : "CREATE"}
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
