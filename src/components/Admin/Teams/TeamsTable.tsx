import { useEffect, useState } from "react";
import type { Team } from "../../../types/admin";
import { teamsApi } from "../../../utils/adminSupabase";
import { Modal } from "../Modal";
import { TeamForm } from "./TeamForm";
import { useToast } from "../Toast";

type TeamWithPlayerCount = Team & { player_count: number };

export const TeamsTable = () => {
  const [teams, setTeams] = useState<TeamWithPlayerCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTeams();
    const unsubscribe = teamsApi.subscribe(() => fetchTeams());
    return unsubscribe;
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsApi.getAllWithPlayerCount();
      setTeams(data);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to fetch teams",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (team?: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: Omit<Team, "id" | "created_at">) => {
    setIsSaving(true);
    try {
      if (selectedTeam) {
        await teamsApi.update(selectedTeam.id, formData);
        showToast("Team updated successfully", "success");
      } else {
        await teamsApi.create(formData);
        showToast("Team created successfully", "success");
      }
      setIsModalOpen(false);
      await fetchTeams();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save team",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    try {
      await teamsApi.delete(id);
      showToast("Team deleted successfully", "success");
      await fetchTeams();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to delete team",
        "error"
      );
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

  const emptyTeamsCount = teams.filter((t) => t.player_count === 0).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black uppercase tracking-widest">
          Teams Management
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          + ADD TEAM
        </button>
      </div>

      {emptyTeamsCount > 0 && (
        <div className="p-3 bg-yellow-50 border-2 border-yellow-500 text-yellow-900 text-sm font-semibold">
          ⚠ {emptyTeamsCount} team{emptyTeamsCount !== 1 ? "s" : ""} with no players detected. These may be placeholder or duplicate entries — review and delete them if needed.
        </div>
      )}

      <div className="bg-white border-2 border-black overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100">
              <th className="text-left px-4 py-3 font-black text-xs uppercase">
                Name
              </th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">
                Players
              </th>
              <th className="text-center px-4 py-3 font-black text-xs uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr
                key={team.id}
                className={
                  team.player_count === 0
                    ? "bg-yellow-50 border-l-4 border-l-yellow-500"
                    : idx % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
                }
              >
                <td className="px-4 py-3 font-semibold">{team.name}</td>
                <td className="px-4 py-3 text-center">
                  {team.player_count === 0 ? (
                    <span className="inline-block px-2 py-0.5 bg-yellow-200 border border-yellow-500 text-yellow-900 font-black text-xs uppercase">
                      0 — BRAK
                    </span>
                  ) : (
                    <span className="font-semibold">{team.player_count}</span>
                  )}
                </td>
                <td className="px-4 py-3 flex gap-2 justify-center">
                  <button
                    onClick={() => handleOpenModal(team)}
                    className="px-3 py-1 bg-white border-2 border-black text-black font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="px-3 py-1 bg-red-600 border-2 border-red-600 text-white font-bold text-xs uppercase hover:bg-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teams.length === 0 && (
          <div className="p-8 text-center text-gray-600">
            <p className="font-semibold">No teams found. Create your first team!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={selectedTeam ? "EDIT TEAM" : "ADD NEW TEAM"}
        onClose={() => setIsModalOpen(false)}
      >
        <TeamForm
          team={selectedTeam}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
};
