import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "../Layout/Skeleton";
import { usePublicData } from "../../hooks/usePublicData";
import type { PublicStageGroup, PublicTeam } from "../../types/publicData";

interface TeamStats {
  id: string;
  name: string;
  goals_for: number;
  goals_against: number;
  points: number;
}

const compareTeams = (a: TeamStats, b: TeamStats) => {
  if (b.points !== a.points) return b.points - a.points;

  const goalDiffA = a.goals_for - a.goals_against;
  const goalDiffB = b.goals_for - b.goals_against;

  if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
  return b.goals_for - a.goals_for;
};

const StandingsView = () => {
  const { data } = usePublicData();
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [activeGroup, setActiveGroup] = useState<string>("");

  const stageGroups = useMemo<PublicStageGroup[]>(
    () =>
      activeStage === 1
        ? data?.firstStageGroups || []
        : data?.secondStageGroups || [],
    [activeStage, data?.firstStageGroups, data?.secondStageGroups],
  );

  const availableGroups = useMemo(() => {
    const groups = stageGroups
      .map((row) => row.group_code)
      .filter((group): group is string => Boolean(group));

    return [...new Set(groups)].sort();
  }, [stageGroups]);

  const teamsLookup = useMemo(
    () =>
      new Map<string, PublicTeam>(
        (data?.teams || []).map((team) => [team.id, team]),
      ),
    [data?.teams],
  );

  const teams = useMemo<TeamStats[]>(() => {
    if (!activeGroup) return [];

    const selectedGroup = stageGroups.find(
      (group) => group.group_code === activeGroup,
    );
    const stageTeams = selectedGroup?.teams?.teams || [];

    const merged = stageTeams.map((team) => ({
      id: team.id,
      name: teamsLookup.get(team.id)?.name || "NIEZNANA",
      points: team.points,
      goals_for: team.goals_for,
      goals_against: team.goals_against,
    }));

    return merged.sort(compareTeams);
  }, [activeGroup, stageGroups, teamsLookup]);

  const bestThirdPlaceIds = useMemo(() => {
    const thirdPlaceTeams = stageGroups
      .map((group) => {
        const merged = (group.teams?.teams || []).map((team) => ({
          id: team.id,
          name: teamsLookup.get(team.id)?.name || "NIEZNANA",
          points: team.points,
          goals_for: team.goals_for,
          goals_against: team.goals_against,
        }));

        const sorted = [...merged].sort(compareTeams);
        return sorted[2] || null;
      })
      .filter((team): team is TeamStats => Boolean(team));

    return new Set(
      [...thirdPlaceTeams].sort(compareTeams).slice(0, 2).map((team) => team.id),
    );
  }, [stageGroups, teamsLookup]);

  const groupsLoading = !data;
  const loading = !data;

  useEffect(() => {
    if (availableGroups.length > 0 && !availableGroups.includes(activeGroup)) {
      setActiveGroup(availableGroups[0]);
    }

    if (availableGroups.length === 0 && activeGroup) {
      setActiveGroup("");
    }
  }, [availableGroups, activeGroup]);

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
      {/* Header Section */}
      <header className="mb-8 md:mb-12">
        <h1 className="font-black text-4xl md:text-6xl lg:text-8xl uppercase tracking-tighter leading-none mb-2 md:mb-4">
          TABELE <span className="text-red-600">LIGOWE</span>
        </h1>
        <div className="h-2 w-24 md:w-32 bg-black mb-6"></div>
        <span className="bg-black text-white px-4 py-2 font-black text-xs md:text-sm tracking-widest inline-block">
          SEZON 2026
        </span>
      </header>

      {/* Stage Selection */}
      <section className="mb-12 md:mb-16">
        <div className="flex items-start md:items-center gap-2 md:gap-4 mb-5 md:mb-7 flex-wrap">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2)}
              className={`px-3 md:px-4 py-2 font-black text-lg md:text-2xl uppercase transition-none border-2 border-black ${
                activeStage === s
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              ETAP {s}
            </button>
          ))}
          <h2 className="w-full md:w-auto font-extrabold text-3xl md:text-4xl uppercase tracking-tight md:ml-4 leading-none mt-1 md:mt-0">
            {activeStage === 1 ? "FAZA GRUPOWA" : "TOP 8"}
          </h2>
        </div>

        {/* Group Selection */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
          {groupsLoading ? (
            <div className="text-gray-500 font-black text-sm md:text-base">
              Ładowanie grup...
            </div>
          ) : availableGroups.length > 0 ? (
            availableGroups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`w-10 h-10 md:w-12 md:h-12 font-black text-lg md:text-xl transition-none border-2 border-black ${
                  activeGroup === g
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {g}
              </button>
            ))
          ) : (
            <div className="text-gray-500 font-black text-sm md:text-base">
              Brak dostępnych grup
            </div>
          )}
        </div>

        {/* Standings Table */}
        <div className="border-2 border-black bg-white overflow-hidden">
          {/* Table Header */}
          <div className="bg-black text-white p-3 md:p-4 border-b-2 border-black">
            <h3 className="font-black text-lg md:text-2xl">
              GRUPA {activeGroup || "—"}
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-100 font-black text-xs md:text-sm uppercase tracking-widest border-b-2 border-black">
                  <th className="p-2 md:p-4 text-center min-w-[40px]">POZ</th>
                  <th className="p-2 md:p-4 min-w-[150px]">DRUŻYNA</th>
                  <th className="p-2 md:p-4 text-center min-w-[50px]">PKT</th>
                  <th className="p-2 md:p-4 text-center min-w-[60px]">BZ:BS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b-2 border-black">
                      <td className="p-2 md:p-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="p-2 md:p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-2 md:p-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </td>
                      <td className="p-2 md:p-4">
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : teams.length > 0 ? (
                  teams.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b-2 border-black hover:bg-gray-50 ${
                        idx === 0 || idx === 1
                          ? "text-red-700 font-extrabold text-sm md:text-base"
                          : activeStage === 1 && idx === 2 && bestThirdPlaceIds.has(row.id)
                            ? "text-red-600 font-bold text-xs md:text-sm"
                            : "font-bold text-xs md:text-sm"
                      }`}
                    >
                      <td className="p-2 md:p-4 text-center">
                        {idx + 1}
                      </td>
                      <td className="p-2 md:p-4 truncate">{row.name}</td>
                      <td className="p-2 md:p-4 text-center">{row.points}</td>
                      <td className="p-2 md:p-4 text-center font-mono">
                        {row.goals_for}:{row.goals_against}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 md:py-20 text-center text-gray-400 text-sm md:text-base"
                    >
                      BRAK DANYCH
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default StandingsView;
