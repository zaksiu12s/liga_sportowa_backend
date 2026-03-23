import { useState } from "react";
import type { Team } from "../../../types/admin";

interface TeamFormProps {
  team?: Team;
  onSubmit: (data: Omit<Team, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TeamForm = ({
  team,
  onSubmit,
  onCancel,
  isLoading = false,
}: TeamFormProps) => {
  const [formData, setFormData] = useState({
    name: team?.name || "",
    group: team?.group || "A",
    points: team?.points || 0,
    goals_for: team?.goals_for || 0,
    goals_against: team?.goals_against || 0,
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("_") || name.includes("goals") || name === "points"
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Team name is required");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save team");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Team Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black placeholder-gray-400 focus:outline-none focus:border-red-600"
          placeholder="e.g., Team Alpha"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Group
        </label>
        <select
          name="group"
          value={formData.group}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          disabled={isLoading}
        >
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Points
        </label>
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          min="0"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Goals For
        </label>
        <input
          type="number"
          name="goals_for"
          value={formData.goals_for}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          min="0"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
          Goals Against
        </label>
        <input
          type="number"
          name="goals_against"
          value={formData.goals_against}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white border-2 border-black text-black focus:outline-none focus:border-red-600"
          min="0"
          disabled={isLoading}
        />
      </div>

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
          {isLoading ? "SAVING..." : team ? "UPDATE" : "CREATE"}
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
