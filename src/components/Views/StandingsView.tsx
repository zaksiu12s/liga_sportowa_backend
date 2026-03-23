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
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section */}
      <header className="mb-16">
        <h1 className="font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-4">
          TABELE LIGOWE
        </h1>
        <div className="h-2 w-32 bg-red-600"></div>
        <p className="mt-6 font-black text-xl uppercase tracking-widest text-black">
          SEZON 2026
        </p>
      </header>

      {/* Stage Selection */}
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2)}
              className={`px-4 py-2 font-black text-2xl uppercase transition-none border-2 border-black ${
                activeStage === s
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              ETAP {s}
            </button>
          ))}
          <h2 className="font-extrabold text-4xl uppercase tracking-tight ml-4">
            {activeStage === 1 ? "FAZA GRUPOWA" : "TOP 8 - ELIMINACJE"}
          </h2>
        </div>

        {/* Group Selection */}
        <div className="flex gap-4 mb-8">
          {groupsLoading ? (
            <div className="text-gray-500 font-black">Ładowanie grup...</div>
          ) : availableGroups.length > 0 ? (
            availableGroups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`w-12 h-12 font-black text-xl transition-none border-2 border-black ${
                  activeGroup === g
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {g}
              </button>
            ))
          ) : (
            <div className="text-gray-500 font-black">Brak dostępnych grup</div>
          )}
        </div>

        {/* Standings Table */}
        <div className="border-2 border-black bg-white overflow-hidden">
          {/* Table Header */}
          <div className="bg-black text-white p-4 border-b-2 border-black">
            <h3 className="font-black text-2xl">
              GRUPA {activeGroup || "—"}
            </h3>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 font-black text-xs uppercase tracking-widest border-b-2 border-black">
                  <th className="p-4">POZ</th>
                  <th className="p-4">DRUŻYNA</th>
                  <th className="p-4 text-center">PKT</th>
                  <th className="p-4 text-center">BZ:BS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b-2 border-black">
                      <td className="p-4">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : teams.length > 0 ? (
                  teams.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b-2 border-black font-bold ${
                        idx === 0 ? "bg-red-600 text-white" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-4">{idx + 1}</td>
                      <td className="p-4">{row.name}</td>
                      <td className="p-4 text-center">{row.points}</td>
                      <td className="p-4 text-center font-mono">
                        {row.goals_for}:{row.goals_against}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400">
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
