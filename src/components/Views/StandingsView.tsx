import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { Skeleton } from "../Layout/Skeleton";

interface TeamStats {
  id: string;
  name: string;
  goals_for: number;
  goals_against: number;
  points: number;
}

const StandingsView = () => {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // Fetch available groups for the selected stage
  useEffect(() => {
    const fetchAvailableGroups = async () => {
      try {
        setGroupsLoading(true);
        const stageName = activeStage === 1 ? "first_stage" : "second_stage";

        const { data, error } = await (supabase as any)
          .from(stageName)
          .select("group_code")
          .order("group_code", { ascending: true });

        if (error && error.code !== "PGRST116") throw error;

        const groups = data?.map((row: any) => row.group_code).filter(Boolean) || [];
        const uniqueGroups = [...new Set(groups)] as string[];

        setAvailableGroups(uniqueGroups);

        // Auto-select first group
        if (uniqueGroups.length > 0 && !uniqueGroups.includes(activeGroup)) {
          setActiveGroup(uniqueGroups[0]);
        }
      } catch (err) {
        console.error("Error fetching available groups:", err);
        setAvailableGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchAvailableGroups();
  }, [activeStage]);

  // Fetch teams for the selected group
  useEffect(() => {
    if (!activeGroup) return;

    const fetchStageData = async () => {
      try {
        setLoading(true);
        const stageName = activeStage === 1 ? "first_stage" : "second_stage";

        const { data, error } = await (supabase as any)
          .from(stageName)
          .select("*")
          .eq("group_code", activeGroup)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data && data.teams) {
          const teamsArray = data.teams.teams || [];

          // Get team IDs and fetch their names from teams table
          const teamIds = teamsArray.map((t: any) => t.id);

          if (teamIds.length > 0) {
            const { data: teamNamesData, error: namesError } = await supabase
              .from("teams")
              .select("id, name")
              .in("id", teamIds);

            if (namesError) throw namesError;

            // Create a map of ID -> name
            const nameMap = new Map(teamNamesData?.map((t: any) => [t.id, t.name]) || []);

            // Merge names with stats
            const teamsWithNames: TeamStats[] = teamsArray.map((team: any) => ({
              id: team.id,
              name: nameMap.get(team.id) || "NIEZNANA",
              points: team.points,
              goals_for: team.goals_for,
              goals_against: team.goals_against,
            }));

            const sortedTeams = teamsWithNames.sort(
              (a: TeamStats, b: TeamStats) => {
                if (b.points !== a.points) return b.points - a.points;
                return (b.goals_for - b.goals_against) -
                       (a.goals_for - a.goals_against);
              }
            );

            setTeams(sortedTeams);
          } else {
            setTeams([]);
          }
        } else {
          setTeams([]);
        }
      } catch (err) {
        console.error("Error fetching standings:", err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStageData();
  }, [activeStage, activeGroup]);

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
      {/* Header Section */}
      <header className="mb-10 md:mb-16">
        <h1 className="font-black text-4xl md:text-6xl lg:text-8xl uppercase tracking-tighter leading-none mb-2 md:mb-4">
          TABELE LIGOWE
        </h1>
        <div className="h-2 w-24 md:w-32 bg-red-600"></div>
        <p className="mt-3 md:mt-6 font-black text-lg md:text-xl uppercase tracking-widest text-black">
          SEZON 2026
        </p>
      </header>

      {/* Stage Selection */}
      <section className="mb-12 md:mb-20">
        <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
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
          <h2 className="font-extrabold text-2xl md:text-4xl uppercase tracking-tight md:ml-4">
            {activeStage === 1 ? "FAZA GRUPOWA" : "TOP 8"}
          </h2>
        </div>

        {/* Group Selection */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
          {groupsLoading ? (
            <div className="text-gray-500 font-black text-sm md:text-base">Ładowanie grup...</div>
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
            <div className="text-gray-500 font-black text-sm md:text-base">Brak dostępnych grup</div>
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
                      className={`border-b-2 border-black font-bold text-xs md:text-sm ${
                        idx === 0 ? "bg-red-600 text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-2 md:p-4 text-center">{idx + 1}</td>
                      <td className="p-2 md:p-4 truncate">{row.name}</td>
                      <td className="p-2 md:p-4 text-center">{row.points}</td>
                      <td className="p-2 md:p-4 text-center font-mono">
                        {row.goals_for}:{row.goals_against}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 md:py-20 text-center text-gray-400 text-sm md:text-base">
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
