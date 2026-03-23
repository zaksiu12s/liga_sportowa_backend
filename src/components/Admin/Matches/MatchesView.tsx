import { useState, useEffect } from "react";
import type { Match } from "../../../types/admin";
import { matchesApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";
import { MatchResultForm } from "./MatchResultForm";
import { Modal } from "../Modal";

const FIRST_STAGE_GROUPS = ["A", "B", "C"];
const SECOND_STAGE_GROUPS = ["A", "B"];
const FINAL_STAGE_GROUPS = ["final", "semi-final-a", "semi-final-b", "3rd-place"];
const STAGES = ["first_stage", "second_stage", "final_stage"];

export const MatchesView = () => {
  const [round, setRound] = useState(1);
  const [stage, setStage] = useState<"first_stage" | "second_stage" | "final_stage">("first_stage");
  const [selectedGroup, setSelectedGroup] = useState<string>("A");
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const { showToast } = useToast();

  // Determine which groups to show based on stage
  const availableGroups = stage === "final_stage"
    ? FINAL_STAGE_GROUPS
    : stage === "second_stage"
    ? SECOND_STAGE_GROUPS
    : FIRST_STAGE_GROUPS;

  // Reset group if it's not available for current stage
  useEffect(() => {
    if (!availableGroups.includes(selectedGroup)) {
      setSelectedGroup(availableGroups[0]);
    }
  }, [stage]); // Only depend on stage since availableGroups is derived from it

  useEffect(() => {
    loadMatches();
  }, [selectedGroup, round, stage]);

  const loadMatches = async () => {
    try {
      console.log(`Loading matches for group: ${selectedGroup}, stage: ${stage}`);
      const data = await matchesApi.getByGroupAndStage(selectedGroup, stage as "first_stage" | "second_stage" | "final_stage");
      console.log(`Loaded ${data.length} matches`);
      if (data.length > 0) {
        console.log("First match data:", data[0]);
        console.log("All match statuses:", data.map(m => ({ id: m.id, status: m.status })));
      }
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to load matches",
        "error"
      );
      setMatches([]);
    }
  };

  const handleGenerateRound = async () => {
    setLoadingGenerate(true);
    try {
      console.log(`[MatchesView] Generating matches for ${stage}, round ${round}`);
      const result = await matchesApi.generateRoundRobinMatches(stage as "first_stage" | "second_stage", round);
      console.log(`[MatchesView] Generation complete. Created ${result.length} matches`);
      showToast(`Generated ${result.length} matches for round ${round}`, "success");
      await loadMatches();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[MatchesView] Generation error:`, error);
      showToast(
        `Failed to generate matches: ${errorMsg}`,
        "error"
      );
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleUpdateScore = async (scoreHome: number, scoreAway: number, goalScorers?: { goals: Array<{ team_id: string; player_id: string; time: number }> }) => {
    if (!selectedMatch) return;
    try {
      await matchesApi.updateMatchScore(selectedMatch.id, scoreHome, scoreAway, goalScorers);
      showToast("Match score updated and standings recalculated", "success");
      setIsModalOpen(false);
      setSelectedMatch(null);
      await loadMatches();
    } catch (error) {
      showToast("Failed to update match", "error");
      console.error(error);
    }
  };

  // Filter by round - if round column doesn't exist in DB, show all matches
  const roundMatches = matches; // Show all matches since round column doesn't exist yet
  const finishedMatches = roundMatches.filter((m) => m.status === "finished");
  const scheduledMatches = roundMatches.filter((m) => m.status === "scheduled");

  console.log("Render: roundMatches:", roundMatches.length, "finished:", finishedMatches.length, "scheduled:", scheduledMatches.length);

  return (
    <div className="space-y-6">
      {/* Stage and Round Selector */}
      <div className="bg-white border-2 border-black p-4 space-y-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2">
            Stage
          </label>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStage(s as "first_stage" | "second_stage" | "final_stage");
                  setRound(1);
                  // Set appropriate default group for stage
                  if (s === "final_stage") {
                    setSelectedGroup("final");
                  } else if (s === "second_stage") {
                    setSelectedGroup("A");
                  } else {
                    setSelectedGroup("A");
                  }
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

        {/* Round Selector - Only for first/second stage */}
        {stage !== "final_stage" && (
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Round
            </label>
            <select
              value={round}
              onChange={(e) => setRound(parseInt(e.target.value))}
              className="px-3 py-2 border-2 border-black"
            >
              {[1, 2, 3, 4, 5, 6].map((r) => (
                <option key={r} value={r}>
                  Round {r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Generate Button - Only for first/second stage */}
        {stage !== "final_stage" && (
          <button
            onClick={handleGenerateRound}
            disabled={loadingGenerate}
            className="w-full px-4 py-2 bg-black text-white border-2 border-black font-bold text-xs uppercase hover:bg-gray-800 disabled:opacity-50"
          >
            {loadingGenerate ? "Generating..." : "Generate Round Matches"}
          </button>
        )}
      </div>

      {/* Group Selector */}
      <div className="bg-white border-2 border-black p-4">
        <label className="block text-xs font-black uppercase tracking-widest mb-2">
          {stage === "final_stage" ? "Match Type" : "Group"}
        </label>
        <div className="flex gap-2 flex-wrap">
          {availableGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 border-2 font-bold text-xs uppercase ${
                selectedGroup === group
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black hover:bg-gray-100"
              }`}
            >
              {group.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Finished Matches */}
      {finishedMatches.length > 0 && (
        <div className="bg-white border-2 border-black p-4 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest">
            Finished Matches
          </h3>
          {finishedMatches.map((match) => (
            <div
              key={match.id}
              className="flex justify-between items-center border-2 border-black p-3 bg-green-50"
            >
              <div className="flex-1">
                <div className="font-bold">
                  {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                </div>
                <div className="text-sm text-gray-600">
                  Final: {match.score_home} - {match.score_away}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedMatch(match);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Matches */}
      {scheduledMatches.length > 0 && (
        <div className="bg-white border-2 border-black p-4 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-widest">
            Scheduled Matches
          </h3>
          {scheduledMatches.map((match) => (
            <div
              key={match.id}
              className="flex justify-between items-center border-2 border-black p-3 bg-gray-50"
            >
              <div className="flex-1">
                <div className="font-bold">
                  {match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}
                </div>
                <div className="text-xs text-gray-600">
                  {match.scheduled_at
                    ? new Date(match.scheduled_at).toLocaleString()
                    : "TBD"}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedMatch(match);
                  setIsModalOpen(true);
                }}
                className="px-3 py-1 border-2 border-black font-bold text-xs hover:bg-blue-100"
              >
                Enter Result
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No Matches Found Message */}
      {roundMatches.length === 0 && (
        <div className="text-center text-gray-500 py-8 border-2 border-black bg-white">
          No matches for round {round} in group {selectedGroup.toUpperCase()}.
          {stage === "first_stage" || stage === "second_stage"
            ? " Generate them using the button above."
            : ""}
        </div>
      )}

      {/* Debug: Show all matches regardless of status */}
      {roundMatches.length > 0 && finishedMatches.length === 0 && scheduledMatches.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4">
          <div className="font-bold text-yellow-900 mb-2">
            DEBUG: {roundMatches.length} matches loaded but none have status "finished" or "scheduled"
          </div>
          <div className="space-y-2">
            {roundMatches.map(m => (
              <div key={m.id} className="text-xs bg-white border border-yellow-300 p-2">
                {m.home_team?.name || `Team ${m.home_team_id}`} vs {m.away_team?.name || `Team ${m.away_team_id}`}
                <span className="ml-2 font-mono text-red-600">(status: "{m.status}" | score: {m.score_home}-{m.score_away})</span>
              </div>
            ))}
          </div>
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
    </div>
  );
};
