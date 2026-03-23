import { useState, useEffect } from "react";
import type { Player, Team } from "../../../types/admin";
import { teamsApi } from "../../../utils/adminSupabase";

interface PlayerFormProps {
  player?: Player;
  onSubmit: (data: Omit<Player, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
}

export const PlayerForm = ({ player, onSubmit, onCancel }: PlayerFormProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: player?.first_name || "",
    last_name: player?.last_name || "",
    class_code: player?.class_code || "",
    team_id: player?.team_id || "",
    school: player?.school || "zsem",
  });

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.team_id) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">First Name *</label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) =>
            setFormData({ ...formData, first_name: e.target.value })
          }
          className="w-full px-3 py-2 border-2 border-black"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Last Name *</label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
          className="w-full px-3 py-2 border-2 border-black"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Class Code</label>
        <input
          type="text"
          value={formData.class_code}
          onChange={(e) =>
            setFormData({ ...formData, class_code: e.target.value })
          }
          className="w-full px-3 py-2 border-2 border-black"
          placeholder="e.g., 4A, 3B"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Team *</label>
        <select
          value={formData.team_id}
          onChange={(e) =>
            setFormData({ ...formData, team_id: e.target.value })
          }
          className="w-full px-3 py-2 border-2 border-black"
          required
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">School</label>
        <input
          type="text"
          value={formData.school}
          onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          className="w-full px-3 py-2 border-2 border-black"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border-2 border-black font-bold hover:bg-red-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border-2 border-black bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : player ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};
