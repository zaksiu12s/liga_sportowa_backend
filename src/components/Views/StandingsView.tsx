import { useState, useEffect } from "react";
import { getTeams } from "../../utils/data";
import type { Tables } from "../../types/supabase";
import { Skeleton } from "../Layout/Skeleton";

type Team = Tables<"teams">;

const StandingsView = () => {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTeams();
        const typedData = data as any as Team[];
        setTeams(typedData);

        // Auto-select first available group
        if (typedData.length > 0) {
          const firstGroup = typedData.find((t) => t.group)?.group;
          if (firstGroup) setActiveGroup(firstGroup);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract unique groups from the database data
  const availableGroups = Array.from(
    new Set(teams.filter((t) => t.group).map((t) => t.group!)),
  ).sort();

  const filteredTeams = teams.filter((t) => {
    if (activeStage === 1) return t.group === activeGroup;
    return false; // To be implemented later (Stage 2)
  });

  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col py-2 px-4">
      <div className="flex flex-col items-center gap-6 flex-shrink-0 mb-12">
        <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-gray-900 pb-2">
          TABELE
        </h1>

        <div className="flex space-x-12">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2)}
              className={`text-[10px] font-black tracking-widest border-b-2 transition-all pb-1 ${
                activeStage === s
                  ? "border-red-600 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              ETAP {s}
            </button>
          ))}
        </div>

        {/* Dynamic Groups from DB */}
        <div className="flex space-x-6">
          {availableGroups.length > 0
            ? availableGroups.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`text-xs font-black min-w-[2rem] h-8 px-2 transition-all ${
                    activeGroup === g
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {g}
                </button>
              ))
            : !loading && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Brak grup w bazie
                </span>
              )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-left text-xs uppercase tracking-wider font-bold">
          <thead className="border-b-2 border-gray-900 sticky top-0  z-10">
            <tr>
              <th className="py-4 px-4 w-12">#</th>
              <th className="py-4">DRUŻYNA</th>
              <th className="py-4 text-center">B</th>
              <th className="py-4 text-right px-4">PKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="py-5 px-4">
                    <Skeleton className="h-4 w-4" />
                  </td>
                  <td className="py-5">
                    <Skeleton className="h-4 w-48" />
                  </td>
                  <td className="py-5">
                    <Skeleton className="h-4 w-12 mx-auto" />
                  </td>
                  <td className="py-5 px-4">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx < 2 ? "text-red-600" : "text-gray-600"}
                >
                  <td className="py-5 px-4">{idx + 1}</td>
                  <td className="py-5 font-black">{row.name}</td>
                  <td className="py-5 text-center font-mono opacity-50">
                    {row.goals_for}:{row.goals_against}
                  </td>
                  <td className="py-5 text-right px-4 font-black">
                    {row.points}
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
  );
};

export default StandingsView;
