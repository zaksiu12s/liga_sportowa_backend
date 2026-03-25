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
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
