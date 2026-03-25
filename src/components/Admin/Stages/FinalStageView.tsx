import { useState, useEffect } from "react";
import type { FinalStageMatch, FinalMatchType, Team } from "../../../types/admin";
import { finalStageApi, teamsApi } from "../../../utils/adminSupabase";
import { Modal } from "../Modal";
import { FinalMatchForm } from "./FinalMatchForm";
import { useToast } from "../Toast";

const MATCH_TYPES: FinalMatchType[] = ["semi-final-A", "semi-final-B", "final", "3rd-place"];

export const FinalStageView = () => {
  const [matches, setMatches] = useState<FinalStageMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<FinalMatchType>("semi-final-A");
  const [selectedMatch, setSelectedMatch] = useState<FinalStageMatch | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesData, teamsData] = await Promise.all([
        finalStageApi.getAll(),
        teamsApi.getAll(),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (error) {
      showToast("Failed to load data", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { type: string; homeTeamId: string; awayTeamId: string; scheduledAt?: string }) => {
    try {
      const newMatch = await finalStageApi.create(data.type, data.homeTeamId, data.awayTeamId, data.scheduledAt);
      setMatches([newMatch, ...matches]);
      setIsModalOpen(false);
      setSelectedMatch(undefined);
      showToast("Match created successfully", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to create match", "error");
    }
  };

  const handleUpdate = async (data: { type: string; homeTeamId: string; awayTeamId: string; scheduledAt?: string }) => {
    if (!selectedMatch) return;
    try {
      const updated = await finalStageApi.update(
        selectedMatch.id,
        data.homeTeamId,
        data.awayTeamId,
        data.scheduledAt
      );
      setMatches(matches.map((m) => (m.id === selectedMatch.id ? updated : m)));
      setIsModalOpen(false);
      setSelectedMatch(undefined);
      showToast("Match updated successfully", "success");
    } catch (error) {
      showToast("Failed to update match", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this match?")) return;
    try {
      await finalStageApi.delete(id);
      setMatches(matches.filter((m) => m.id !== id));
      showToast("Match deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete match", "error");
    }
  };

  const typeMatches = matches.filter((m) => m.type === selectedType);

  if (loading && matches.length === 0) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Match Type Selector */}
      <div className="bg-white border-2 border-black p-4">
        <h3 className="text-sm font-black uppercase tracking-widest mb-4">
          Match Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {MATCH_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                selectedType === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Matches for Selected Type */}
      <div className="bg-white border-2 border-black p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest">
            {selectedType} Matches
          </h3>
          <button
            onClick={() => {
              setSelectedMatch(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800"
          >
            + Add Match
          </button>
        </div>

        {typeMatches.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No matches for {selectedType}
          </div>
        ) : (
          <div className="space-y-2">
            {typeMatches.map((match) => (
              <div
                key={match.id}
                className="flex justify-between items-center border-2 border-black p-3 bg-gray-50"
              >
                <div className="flex-1">
                  <div className="text-sm font-bold">
                    {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                  </div>
                  <div className="text-xs text-gray-600">
                    {match.scheduled_at
                      ? new Date(match.scheduled_at).toLocaleString()
                      : "No time set"
                    }
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMatch(match);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(match.id)}
                    className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={selectedMatch ? "Edit Match" : "Add Match"}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMatch(undefined);
        }}
      >
        <FinalMatchForm
          match={selectedMatch}
          allTeams={teams}
          selectedType={selectedType}
          onSubmit={selectedMatch ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedMatch(undefined);
          }}
        />
      </Modal>
    </div>
  );
};
