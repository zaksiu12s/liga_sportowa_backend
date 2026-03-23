import { useState, useEffect } from "react";
import type { Match } from "../../../types/admin";
import { matchesApi, stagesApi, teamsApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";
import { MatchResultForm } from "./MatchResultForm";
import { Modal } from "../Modal";
import { MATCH_SCHEDULES } from "../../../utils/matchGenerator";

const FIRST_STAGE_GROUPS = ["A", "B", "C"];
const SECOND_STAGE_GROUPS = ["A", "B"];
const FINAL_STAGE_GROUPS = ["final", "semi-final-a", "semi-final-b", "3rd-place"];
const STAGES = ["first_stage", "second_stage", "final_stage"];

interface RoundSchedule {
  round: number;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export const MatchesView = () => {
  // Core state
  const [stage, setStage] = useState<"first_stage" | "second_stage" | "final_stage">("first_stage");
  const [activeTab, setActiveTab] = useState<"generate" | "manual">("generate");
  const [matches, setMatches] = useState<Match[]>([]);
  const { showToast } = useToast();

  // Auto-generate tab state
  const [roundSchedules, setRoundSchedules] = useState<RoundSchedule[]>([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  // Manual add tab state
  const [manualForm, setManualForm] = useState({
    group: "",
    round: 1,
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
  });
  const [loadingManual, setLoadingManual] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<Array<{ id: string; name: string }>>([]);

  // Modal state
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "" });
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Initialize round schedules from MATCH_SCHEDULES
  useEffect(() => {
    const schedules = MATCH_SCHEDULES.map((schedule) => ({
      round: schedule.round,
      date: schedule.date.toISOString().split("T")[0],
      timeStart: schedule.timeStart,
      timeEnd: schedule.timeEnd,
    }));
    setRoundSchedules(schedules);
  }, []);

  // Update available rounds based on stage
  const getAvailableRounds = () => {
    if (stage === "first_stage") return [1, 2, 3, 4, 5];
    if (stage === "second_stage") return [6, 7];
    return [];
  };

  // Get filtered round schedules for current stage
  const getFilteredRoundSchedules = () => {
    const availableRounds = getAvailableRounds();
    return roundSchedules.filter((r) => availableRounds.includes(r.round));
  };

  // Update manual form round when stage changes
  useEffect(() => {
    const availableRounds = getAvailableRounds();
    if (!availableRounds.includes(manualForm.round)) {
      setManualForm({ ...manualForm, round: availableRounds[0] || 1 });
    }
  }, [stage]);

  // Load matches for current stage
  useEffect(() => {
    loadMatches();
  }, [stage]);

  // Update available teams when stage/group changes
  useEffect(() => {
    if (stage !== "final_stage" && manualForm.group && (stage === "first_stage" || stage === "second_stage")) {
      loadTeamsForGroup();
    }
  }, [stage, manualForm.group]);

  const loadMatches = async () => {
    try {
      const data = await matchesApi.getAll();
      const filtered = data.filter((m) => m.stage === stage);
      setMatches(filtered);
    } catch (error) {
      console.error("Failed to load matches:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load matches",
        "error"
      );
      setMatches([]);
    }
  };

  const loadTeamsForGroup = async () => {
    try {
      if (stage === "final_stage") {
        setAvailableTeams([]);
        return;
      }

      const groups = await stagesApi.getGroupsByStage(stage as "first_stage" | "second_stage");
      const group = groups.find((g) => g.group_code === manualForm.group);

      if (group && group.teams?.teams) {
        // Fetch all teams to get names
        const allTeams = await teamsApi.getAll();
        const teamMap = Object.fromEntries(allTeams.map((t) => [t.id, t.name]));

        // Map group team IDs to names
        const teams = group.teams.teams.map((t: any) => ({
          id: t.id,
          name: teamMap[t.id] || `Team ${t.id.slice(0, 8)}`,
        }));
        setAvailableTeams(teams);
      } else {
        setAvailableTeams([]);
      }
    } catch (error) {
      console.error("Failed to load teams for group:", error);
      setAvailableTeams([]);
    }
  };

  const getAvailableGroups = () => {
    if (stage === "final_stage") return FINAL_STAGE_GROUPS;
    if (stage === "second_stage") return SECOND_STAGE_GROUPS;
    return FIRST_STAGE_GROUPS;
  };

  const handleGenerateAll = async () => {
    if (stage === "final_stage") {
      showToast("Cannot generate matches for final stage", "error");
      return;
    }

    setLoadingGenerate(true);
    try {
      console.log(`[MatchesView] Generating all matches for ${stage}`);

      // For each round, generate matches (use filtered schedules)
      let totalCreated = 0;
      const filteredSchedules = getFilteredRoundSchedules();
      for (const schedule of filteredSchedules) {
        const scheduledAt = new Date(`${schedule.date}T${schedule.timeStart}:00`).toISOString();
        const result = await matchesApi.generateRoundRobinMatches(
          stage as "first_stage" | "second_stage",
          schedule.round,
          scheduledAt
        );
        totalCreated += result.length;
      }

      showToast(`Generated ${totalCreated} matches for all rounds`, "success");
      await loadMatches();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[MatchesView] Generation error:`, error);
      showToast(`Failed to generate matches: ${errorMsg}`, "error");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualForm.homeTeamId || !manualForm.awayTeamId) {
      showToast("Please select both teams", "error");
      return;
    }

    if (manualForm.homeTeamId === manualForm.awayTeamId) {
      showToast("Teams must be different", "error");
      return;
    }

    if (!manualForm.date || !manualForm.time) {
      showToast("Please enter date and time", "error");
      return;
    }

    // Validation: Check if teams already played each other in this stage/group
    const duplicateMatch = matches.some(
      (m) =>
        m.stage === stage &&
        m.group === manualForm.group &&
        ((m.home_team_id === manualForm.homeTeamId && m.away_team_id === manualForm.awayTeamId) ||
          (m.home_team_id === manualForm.awayTeamId && m.away_team_id === manualForm.homeTeamId))
    );

    if (duplicateMatch) {
      showToast(
        "These teams already have a match in this group and stage. Teams cannot play twice in the same stage.",
        "error"
      );
      return;
    }

    setLoadingManual(true);
    try {
      const scheduledAt = new Date(`${manualForm.date}T${manualForm.time}:00`).toISOString();

      await matchesApi.create({
        home_team_id: manualForm.homeTeamId,
        away_team_id: manualForm.awayTeamId,
        stage,
        group: manualForm.group,
        scheduled_at: scheduledAt,
        status: "scheduled",
        score_home: null,
        score_away: null,
      } as any);

      showToast("Match added successfully", "success");

      // Reset form
      setManualForm({
        group: "",
        round: 1,
        homeTeamId: "",
        awayTeamId: "",
        date: "",
        time: "",
      });

      await loadMatches();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to add match:", error);
      showToast(`Failed to add match: ${errorMsg}`, "error");
    } finally {
      setLoadingManual(false);
    }
  };

  const handleUpdateScore = async (scoreHome: number, scoreAway: number) => {
    if (!selectedMatch) return;
    try {
      await matchesApi.updateMatchScore(selectedMatch.id, scoreHome, scoreAway);
      showToast("Match score updated and standings recalculated", "success");
      setIsModalOpen(false);
      setSelectedMatch(null);
      await loadMatches();
    } catch (error) {
      showToast("Failed to update match", "error");
      console.error(error);
    }
  };

  const handleEditMatch = (match: Match) => {
    const date = match.scheduled_at ? match.scheduled_at.split("T")[0] : "";
    const time = match.scheduled_at ? match.scheduled_at.split("T")[1]?.slice(0, 5) : "";
    setEditingMatch(match);
    setEditForm({ date, time });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMatch) return;

    if (!editForm.date || !editForm.time) {
      showToast("Please enter date and time", "error");
      return;
    }

    setLoadingEdit(true);
    try {
      const scheduledAt = new Date(`${editForm.date}T${editForm.time}:00`).toISOString();

      await matchesApi.update(editingMatch.id, {
        scheduled_at: scheduledAt,
      });

      showToast("Match updated successfully", "success");
      setIsEditModalOpen(false);
      setEditingMatch(null);
      await loadMatches();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to update match:", error);
      showToast(`Failed to update match: ${errorMsg}`, "error");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      await matchesApi.delete(matchId);
      showToast("Match deleted successfully", "success");
      await loadMatches();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to delete match:", error);
      showToast(`Failed to delete match: ${errorMsg}`, "error");
    }
  };

  // Group matches by group
  const matchesByGroup = getAvailableGroups().reduce((acc, group) => {
    acc[group] = matches.filter((m) => m.group === group);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="space-y-6">
      {/* Stage Selector */}
      <div className="bg-white border-2 border-black p-4">
        <label className="block text-xs font-black uppercase tracking-widest mb-2">
          Stage
        </label>
        <div className="flex gap-2 flex-wrap">
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStage(s as "first_stage" | "second_stage" | "final_stage");
              }}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                stage === s
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {s === "first_stage" ? "First Stage" : s === "second_stage" ? "Second Stage" : "Final Stage"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Selector */}
      {stage !== "final_stage" && (
        <div className="bg-white border-2 border-black p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                activeTab === "generate"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              Generate Multiple Rounds
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                activeTab === "manual"
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              Add Single Match
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Generate Multiple Rounds */}
      {stage !== "final_stage" && activeTab === "generate" && (
        <div className="bg-white border-2 border-black p-4 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest">Round Schedules {stage === "first_stage" ? "(1-5)" : "(6-7)"}</h3>

          {/* Round date inputs */}
          <div className="space-y-3">
            {getFilteredRoundSchedules().map((schedule) => (
              <div key={schedule.round} className="border-2 border-black p-3 bg-gray-50 space-y-2">
                <div className="flex gap-2 items-center">
                  <label className="text-xs font-bold uppercase w-12">Round {schedule.round}:</label>
                  <input
                    type="date"
                    value={schedule.date}
                    onChange={(e) => {
                      const updated = [...roundSchedules];
                      const fullIdx = updated.findIndex((r) => r.round === schedule.round);
                      if (fullIdx !== -1) {
                        updated[fullIdx].date = e.target.value;
                        setRoundSchedules(updated);
                      }
                    }}
                    className="px-2 py-1 border-2 border-black text-xs"
                  />
                  <input
                    type="time"
                    value={schedule.timeStart}
                    onChange={(e) => {
                      const updated = [...roundSchedules];
                      const fullIdx = updated.findIndex((r) => r.round === schedule.round);
                      if (fullIdx !== -1) {
                        updated[fullIdx].timeStart = e.target.value;
                        setRoundSchedules(updated);
                      }
                    }}
                    className="px-2 py-1 border-2 border-black text-xs"
                  />
                  <span className="text-xs font-bold">-</span>
                  <input
                    type="time"
                    value={schedule.timeEnd}
                    onChange={(e) => {
                      const updated = [...roundSchedules];
                      const fullIdx = updated.findIndex((r) => r.round === schedule.round);
                      if (fullIdx !== -1) {
                        updated[fullIdx].timeEnd = e.target.value;
                        setRoundSchedules(updated);
                      }
                    }}
                    className="px-2 py-1 border-2 border-black text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerateAll}
            disabled={loadingGenerate}
            className="w-full px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
          >
            {loadingGenerate ? "Generating..." : "Generate All Matches for This Stage"}
          </button>
        </div>
      )}

      {/* TAB 2: Add Single Match */}
      {stage !== "final_stage" && activeTab === "manual" && (
        <div className="bg-white border-2 border-black p-4">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Add Single Match</h3>

          <form onSubmit={handleAddMatch} className="space-y-3">
            {/* Group selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Group
              </label>
              <select
                value={manualForm.group}
                onChange={(e) => {
                  setManualForm({ ...manualForm, group: e.target.value });
                }}
                className="w-full px-3 py-2 border-2 border-black text-xs"
              >
                <option value="">Select group</option>
                {getAvailableGroups().map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Round selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Round
              </label>
              <select
                value={manualForm.round}
                onChange={(e) => setManualForm({ ...manualForm, round: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-black text-xs"
              >
                {getAvailableRounds().map((r) => (
                  <option key={r} value={r}>
                    Round {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Home team selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Home Team
              </label>
              <select
                value={manualForm.homeTeamId}
                onChange={(e) => setManualForm({ ...manualForm, homeTeamId: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs"
                disabled={!manualForm.group}
              >
                <option value="">Select team</option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Away team selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Away Team
              </label>
              <select
                value={manualForm.awayTeamId}
                onChange={(e) => setManualForm({ ...manualForm, awayTeamId: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs"
                disabled={!manualForm.group}
              >
                <option value="">Select team</option>
                {availableTeams
                  .filter((t) => t.id !== manualForm.homeTeamId)
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Date input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Date
              </label>
              <input
                type="date"
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs"
              />
            </div>

            {/* Time input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-1">
                Time
              </label>
              <input
                type="time"
                value={manualForm.time}
                onChange={(e) => setManualForm({ ...manualForm, time: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loadingManual}
              className="w-full px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
            >
              {loadingManual ? "Adding..." : "Add Match"}
            </button>
          </form>
        </div>
      )}

      {/* Match Display - Group by Group */}
      {matches.length > 0 && (
        <div className="space-y-4">
          {getAvailableGroups().map((group) => {
            const groupMatches = matchesByGroup[group] || [];
            const finished = groupMatches.filter((m) => m.status === "finished");
            const scheduled = groupMatches.filter((m) => m.status === "scheduled");

            if (groupMatches.length === 0) return null;

            return (
              <div key={group} className="border-2 border-black bg-white p-4 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest">Group {group.toUpperCase()}</h3>

                {/* Finished matches */}
                {finished.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase">Finished</div>
                    {finished.map((match) => (
                      <div
                        key={match.id}
                        className="flex justify-between items-center border-2 border-black p-2 bg-green-50 text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-bold">
                            {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                          </div>
                          <div className="text-gray-600">
                            Final: {match.score_home} - {match.score_away}
                          </div>
                        </div>
                        <div className="flex gap-1 whitespace-nowrap ml-2">
                          <button
                            onClick={() => handleEditMatch(match)}
                            className="px-2 py-1 border-2 border-black font-bold text-xs hover:bg-yellow-100"
                          >
                            Edit Match
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMatch(match);
                              setIsModalOpen(true);
                            }}
                            className="px-2 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
                          >
                            Edit Result
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            className="px-2 py-1 border-2 border-red-400 font-bold text-xs text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Scheduled matches */}
                {scheduled.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase">Scheduled</div>
                    {scheduled.map((match) => (
                      <div
                        key={match.id}
                        className="flex justify-between items-center border-2 border-black p-2 bg-gray-50 text-xs"
                      >
                        <div className="flex-1">
                          <div className="font-bold">
                            {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                          </div>
                          <div className="text-gray-600">
                            {match.scheduled_at ? new Date(match.scheduled_at).toLocaleString() : "TBD"}
                          </div>
                        </div>
                        <div className="flex gap-1 whitespace-nowrap ml-2">
                          <button
                            onClick={() => handleEditMatch(match)}
                            className="px-2 py-1 border-2 border-black font-bold text-xs hover:bg-yellow-100"
                          >
                            Edit Match
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMatch(match);
                              setIsModalOpen(true);
                            }}
                            className="px-2 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
                          >
                            Enter Result
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(match.id)}
                            className="px-2 py-1 border-2 border-red-400 font-bold text-xs text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center text-gray-500 py-8 border-2 border-black bg-white">
          No matches yet. Generate matches or add manually.
        </div>
      )}

      {/* Score Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        title={`${selectedMatch?.home_team?.name || "Team A"} vs ${
          selectedMatch?.away_team?.name || "Team B"
        }`}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMatch(null);
        }}
      >
        {selectedMatch && (
          <MatchResultForm
            match={selectedMatch}
            onSubmit={handleUpdateScore}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedMatch(null);
            }}
          />
        )}
      </Modal>

      {/* Edit Match Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title={`Edit Match Date & Time - ${editingMatch?.home_team?.name || "Team A"} vs ${
          editingMatch?.away_team?.name || "Team B"
        }`}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMatch(null);
        }}
      >
        {editingMatch && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Current Match
              </label>
              <div className="border-2 border-black p-3 bg-gray-50 text-sm">
                <div className="font-bold">
                  {editingMatch.home_team?.name || "TBD"} vs {editingMatch.away_team?.name || "TBD"}
                </div>
                <div className="text-xs text-gray-600">
                  Group: {editingMatch.group ? editingMatch.group.toUpperCase() : "N/A"}, Stage: {editingMatch.stage}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Date
              </label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Time
              </label>
              <input
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={loadingEdit}
                className="flex-1 px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
              >
                {loadingEdit ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingMatch(null);
                }}
                className="flex-1 px-4 py-2 bg-white text-black border-2 border-black font-bold text-xs uppercase hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
