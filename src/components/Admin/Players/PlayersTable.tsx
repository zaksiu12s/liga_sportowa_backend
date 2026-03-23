import { useState, useEffect } from "react";
import type { Player } from "../../../types/admin";
import { playersApi } from "../../../utils/adminSupabase";
import { Modal } from "../Modal";
import { PlayerForm } from "./PlayerForm";
import { useToast } from "../Toast";

export const PlayersTable = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadPlayers();
    const unsubscribe = playersApi.subscribe(setPlayers);
    return unsubscribe;
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await playersApi.getAll();
      setPlayers(data);
    } catch (error) {
      showToast("Failed to load players", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Player, "id" | "created_at">) => {
    try {
      await playersApi.create(data);
      showToast("Player created successfully", "success");
      setIsModalOpen(false);
      await loadPlayers();
    } catch (error) {
      showToast("Failed to create player", "error");
      console.error(error);
    }
  };

  const handleUpdate = async (data: Omit<Player, "id" | "created_at">) => {
    if (!selectedPlayer) return;
    try {
      await playersApi.update(selectedPlayer.id, data);
      showToast("Player updated successfully", "success");
      setIsModalOpen(false);
      setSelectedPlayer(undefined);
      await loadPlayers();
    } catch (error) {
      showToast("Failed to update player", "error");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await playersApi.delete(id);
      showToast("Player deleted successfully", "success");
      await loadPlayers();
    } catch (error) {
      showToast("Failed to delete player", "error");
      console.error(error);
    }
  };

  if (loading && players.length === 0) {
    return <div className="p-4">Loading players...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-4 border-b-2 border-black flex justify-between items-center">
        <h2 className="text-2xl font-black">Players</h2>
        <button
          onClick={() => {
            setSelectedPlayer(undefined);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 border-2 border-black bg-black text-white font-bold hover:bg-gray-800"
        >
          + Add Player
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {players.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No players yet</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-gray-100">
                <th className="px-4 py-2 text-left font-bold">First Name</th>
                <th className="px-4 py-2 text-left font-bold">Last Name</th>
                <th className="px-4 py-2 text-left font-bold">Class</th>
                <th className="px-4 py-2 text-left font-bold">Team</th>
                <th className="px-4 py-2 text-left font-bold">School</th>
                <th className="px-4 py-2 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-300 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2">{player.first_name}</td>
                  <td className="px-4 py-2">{player.last_name}</td>
                  <td className="px-4 py-2">{player.class_code || "-"}</td>
                  <td className="px-4 py-2">{player.team?.name || "-"}</td>
                  <td className="px-4 py-2">{player.school}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPlayer(player);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 border-2 border-black font-bold hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="px-3 py-1 border-2 border-black font-bold hover:bg-red-100"
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

      <Modal
        isOpen={isModalOpen}
        title={selectedPlayer ? "Edit Player" : "Add Player"}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlayer(undefined);
        }}
      >
        <PlayerForm
          player={selectedPlayer}
          onSubmit={selectedPlayer ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedPlayer(undefined);
          }}
        />
      </Modal>
    </div>
  );
};
