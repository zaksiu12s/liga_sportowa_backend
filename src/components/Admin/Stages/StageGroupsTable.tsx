import { useState, useEffect } from "react";
import type { StageGroup, StageType, Team } from "../../../types/admin";
import { stagesApi, teamsApi } from "../../../utils/adminSupabase";
import { Modal } from "../Modal";
import { GroupTeamsManager } from "./GroupTeamsManager";
import { useToast } from "../Toast";

interface StageGroupsTableProps {
  stage: StageType;
}

export const StageGroupsTable = ({ stage }: StageGroupsTableProps) => {
  const [groups, setGroups] = useState<StageGroup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StageGroup | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [stage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, teamsData] = await Promise.all([
        stagesApi.getGroupsByStage(stage.name as "first_stage" | "second_stage"),
        teamsApi.getAll(),
      ]);
      setGroups(groupsData);
      setTeams(teamsData);
    } catch (error) {
      showToast("Failed to load groups", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupCode.trim()) {
      showToast("Group code is required", "error");
      return;
    }

    try {
      const newGroup = await stagesApi.createGroup(
        stage.name as "first_stage" | "second_stage",
        newGroupCode.toUpperCase()
      );
      setGroups([...groups, newGroup]);
      setNewGroupCode("");
      showToast("Group created successfully", "success");
    } catch (error) {
      showToast("Failed to create group", "error");
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Delete this group and all its teams?")) return;

    try {
      await stagesApi.deleteGroup(
        stage.name as "first_stage" | "second_stage",
        groupId
      );
      setGroups(groups.filter((g) => g.id !== groupId));
      showToast("Group deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete group", "error");
      console.error(error);
    }
  };

  if (loading && groups.length === 0) {
    return <div className="p-4">Loading groups...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Create Group */}
      <div className="bg-white border-2 border-black p-4">
        <h3 className="text-sm font-black uppercase tracking-widest mb-4">
          Create Group
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupCode}
            onChange={(e) => setNewGroupCode(e.target.value)}
            placeholder="Group code (e.g., A, B, C)"
            maxLength={3}
            className="flex-1 px-3 py-2 border-2 border-black"
          />
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800"
          >
            Create
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white border-2 border-black overflow-x-auto">
        {groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No groups yet. Create your first group!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="px-4 py-3 text-left font-black text-xs uppercase">
                  Group
                </th>
                <th className="px-4 py-3 text-center font-black text-xs uppercase">
                  Teams
                </th>
                <th className="px-4 py-3 text-center font-black text-xs uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, idx) => (
                <tr
                  key={group.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 font-bold">
                    Group {group.group_code}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {group.teams?.teams?.length || 0}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manage Group Modal */}
      {selectedGroup && (
        <Modal
          isOpen={isModalOpen}
          title={`Manage Group ${selectedGroup.group_code}`}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGroup(undefined);
            loadData();
          }}
        >
          <GroupTeamsManager
            stage={stage}
            group={selectedGroup}
            allTeams={teams}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedGroup(undefined);
              loadData();
            }}
          />
        </Modal>
      )}
    </div>
  );
};
