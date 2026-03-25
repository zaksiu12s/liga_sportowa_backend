import { useState, useEffect } from "react";
import type { Match, Team } from "../../../types/admin";
import { teamsApi } from "../../../utils/adminSupabase";

interface MatchFormProps {
  match?: Match;
  onSubmit: (data: Omit<Match, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MatchForm = ({
  match,
  onSubmit,
  onCancel,
  isLoading = false,
}: MatchFormProps) => {
  const [formData, setFormData] = useState({
    home_team_id: match?.home_team_id || "",
    away_team_id: match?.away_team_id || "",
    score_home: match?.score_home || null,
    score_away: match?.score_away || null,
    status: match?.status || "scheduled",
    scheduled_at: match?.scheduled_at
      ? new Date(match.scheduled_at).toISOString().slice(0, 16)
      : "",
    stage: match?.stage || "",
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamsApi.getAll();
        setTeams(data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("score")
        ? value === ""
          ? null
          : parseInt(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.home_team_id || !formData.away_team_id) {
      setError("Both home and away teams are required");
      return;
    }

    if (formData.home_team_id === formData.away_team_id) {
      setError("Home and away teams must be different");
      return;
    }

    if (!formData.scheduled_at) {
      setError("Match date and time are required");
      return;
    }

    const submitData = {
      ...formData,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
    };

    try {
      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save match");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Home Team
        </label>
        <select
          name="home_team_id"
          value={formData.home_team_id}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          disabled={isLoading}
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Away Team
        </label>
        <select
          name="away_team_id"
          value={formData.away_team_id}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          disabled={isLoading}
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Scheduled Date & Time
        </label>
        <input
          type="datetime-local"
          name="scheduled_at"
          value={formData.scheduled_at}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Stage
        </label>
        <input
          type="text"
          name="stage"
          value={formData.stage}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-red-600"
          placeholder="e.g., Group A, Semi-final"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          disabled={isLoading}
        >
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {(formData.status === "live" || formData.status === "finished") && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Home Score
            </label>
            <input
              type="number"
              name="score_home"
              value={formData.score_home ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
              min="0"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
              Away Score
            </label>
            <input
              type="number"
              name="score_away"
              value={formData.score_away ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
              min="0"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-black text-white border-2 border-black font-black text-xs uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50"
        >
          {isLoading ? "SAVING..." : match ? "UPDATE" : "CREATE"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-white text-black border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition-colors"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};
