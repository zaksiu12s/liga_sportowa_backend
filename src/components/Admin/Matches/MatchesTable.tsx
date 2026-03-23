import { useEffect, useState } from "react";
import type { Match } from "../../../types/admin";
import { matchesApi } from "../../../utils/adminSupabase";
import { Modal } from "../Modal";
import { MatchForm } from "./MatchForm";
import { useToast } from "../Toast";

export const MatchesTable = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchMatches();
    const unsubscribe = matchesApi.subscribe(setMatches);
    return unsubscribe;
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await matchesApi.getAll();
      setMatches(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to fetch matches",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (match?: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: Omit<Match, "id" | "created_at">) => {
    setIsSaving(true);
    try {
      if (selectedMatch) {
        await matchesApi.update(selectedMatch.id, formData);
        showToast("Match updated successfully", "success");
      } else {
        await matchesApi.create(formData);
        showToast("Match created successfully", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save match",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      await matchesApi.delete(id);
      showToast("Match deleted successfully", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete match",
        "error"
      );
    }
  };

  const filteredMatches = statusFilter
    ? matches.filter((m) => m.status === statusFilter)
    : matches;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-gray-100 text-gray-900";
      case "live":
        return "bg-red-100 text-red-900 font-bold";
      case "finished":
        return "bg-green-100 text-green-900";
      default:
        return "bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-black border-r-transparent animate-spin mb-4"></div>
          <p className="font-black uppercase text-sm tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black uppercase tracking-widest">
          Matches Management
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + SCHEDULE MATCH
        </button>
      </div>

      <div className="bg-white border-2 border-black p-4 flex gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 border-2 font-black text-xs uppercase ${
            statusFilter === ""
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black hover:bg-gray-100"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("scheduled")}
          className={`px-4 py-2 border-2 font-black text-xs uppercase ${
            statusFilter === "scheduled"
              ? "bg-gray-400 text-white border-gray-400"
              : "bg-white text-black border-black hover:bg-gray-100"
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setStatusFilter("live")}
          className={`px-4 py-2 border-2 font-black text-xs uppercase ${
            statusFilter === "live"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-black border-black hover:bg-red-100"
          }`}
        >
          Live
        </button>
        <button
          onClick={() => setStatusFilter("finished")}
          className={`px-4 py-2 border-2 font-black text-xs uppercase ${
            statusFilter === "finished"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-black border-black hover:bg-green-100"
          }`}
        >
          Finished
        </button>
      </div>

      <div className="bg-white border-2 border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left px-4 py-3 font-black text-xs uppercase">Home Team</th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">vs</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase">Away Team</th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">Score</th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">Status</th>
              <th className="text-left px-4 py-3 font-black text-xs uppercase">Date</th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match, idx) => (
              <tr
                key={match.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-semibold">{match.home_team?.name || "-"}</td>
                <td className="px-4 py-3 text-center">⚽</td>
                <td className="px-4 py-3 font-semibold">{match.away_team?.name || "-"}</td>
                <td className="px-4 py-3 text-center font-black">
                  {match.score_home !== null && match.score_away !== null
                    ? `${match.score_home} - ${match.score_away}`
                    : "-"}
                </td>
                <td className={`px-4 py-3 text-center ${getStatusColor(match.status)}`}>
                  {match.status.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-xs">
                  {match.scheduled_at
                    ? new Date(match.scheduled_at).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => handleOpenModal(match)}
                    className="px-3 py-1 bg-white border-2 border-black text-black font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="px-3 py-1 bg-red-600 border-2 border-red-600 text-white font-bold text-xs uppercase hover:bg-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMatches.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <p className="font-semibold">
              {statusFilter
                ? `No ${statusFilter} matches found.`
                : "No matches found. Schedule your first match!"}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={selectedMatch ? "EDIT MATCH" : "SCHEDULE NEW MATCH"}
        onClose={() => setIsModalOpen(false)}
      >
        <MatchForm
          match={selectedMatch}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
};
