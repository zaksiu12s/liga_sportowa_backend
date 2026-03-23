import { useState } from "react";
import type { StageGroup, Team, StageType } from "../../../types/admin";
import { stagesApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";

interface GroupTeamsManagerProps {
  stage: StageType;
  group: StageGroup;
  allTeams: Team[];
  onClose: () => void;
}

export const GroupTeamsManager = ({
  stage,
  group,
  allTeams,
  onClose,
}: GroupTeamsManagerProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [groupTeams, setGroupTeams] = useState(group.teams?.teams || []);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const availableTeams = allTeams.filter(
    (t) => !groupTeams.some((gt) => gt.id === t.id)
  );

  const handleAddTeam = async () => {
    if (!selectedTeamId) {
      showToast("Select a team", "error");
      return;
    }

    setSaving(true);
    try {
      const updated = await stagesApi.addTeamToGroup(
        stage.name as "first_stage" | "second_stage",
        group.id,
        selectedTeamId
      );
      setGroupTeams(updated.teams?.teams || []);
      setSelectedTeamId("");
      showToast("Team added successfully", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add team",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm("Remove this team from group?")) return;

    setSaving(true);
    try {
      const updated = await stagesApi.removeTeamFromGroup(
        stage.name as "first_stage" | "second_stage",
        group.id,
        teamId
      );
      setGroupTeams(updated.teams?.teams || []);
      showToast("Team removed successfully", "success");
    } catch (error) {
      showToast("Failed to remove team", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {/* Add Team Section */}
      <div className="border-b-2 border-black pb-4">
        <h4 className="text-xs font-black uppercase tracking-widest mb-2">
          Add Team
        </h4>
        <div className="flex gap-2">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 px-3 py-2 border-2 border-black"
            disabled={saving || availableTeams.length === 0}
          >
            <option value="">Select team...</option>
            {availableTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddTeam}
            disabled={saving || !selectedTeamId}
            className="px-3 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Teams in Group */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-widest mb-2">
          Teams in Group ({groupTeams.length})
        </h4>
        {groupTeams.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            No teams in this group
          </div>
        ) : (
          <div className="space-y-2">
            {groupTeams.map((teamStat) => {
              const teamName = allTeams.find((t) => t.id === teamStat.id)?.name;
              return (
                <div
                  key={teamStat.id}
                  className="flex justify-between items-center border-2 border-black p-2 bg-gray-50"
                >
                  <div className="text-sm">
                    <div className="font-bold">{teamName}</div>
                    <div className="text-xs text-gray-600">
                      Pts: {teamStat.points} | GF: {teamStat.goals_for} | GA:{" "}
                      {teamStat.goals_against}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTeam(teamStat.id)}
                    disabled={saving}
                    className="px-2 py-1 border-2 border-black font-bold text-xs hover:bg-red-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex gap-2 pt-4 border-t-2 border-black">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  );
};
