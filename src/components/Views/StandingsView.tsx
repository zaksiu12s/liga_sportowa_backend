import { useState, useEffect } from "react";
import { getFirstStage, getSecondStage } from "../../utils/data";
import type { StageRow, StageTeamRow } from "../../utils/data";
import { Skeleton } from "../Layout/Skeleton";

const StandingsView = () => {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [stageData, setStageData] = useState<StageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setActiveGroup(""); // reset grupy przy zmianie etapu
        const data =
          activeStage === 1 ? await getFirstStage() : await getSecondStage();
        setStageData(data);

        // Auto-select pierwsza dostępna grupa
        const firstGroup = [
          ...new Set(data.map((r) => r.group_code)),
        ].sort()[0];
        if (firstGroup) setActiveGroup(firstGroup);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeStage]); // <-- re-fetch przy zmianie etapu

  // Unikalne grupy z bazy
  const availableGroups = Array.from(
    new Set(stageData.map((row) => row.group_code)),
  ).sort();

  // Znajdź row dla aktywnej grupy, wyciągnij teams[]
  const activeRow = stageData.find((r) => r.group_code === activeGroup);
  const filteredTeams: StageTeamRow[] = activeRow?.teams ?? [];

  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col py-2 px-4 dark:text-white">
      <div className="flex flex-col items-center gap-6 flex-shrink-0 mb-12">
        <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-gray-900 pb-2 dark:border-white">
          TABELE
        </h1>

        <div className="flex space-x-12">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStage(s as 1 | 2)}
              className={`text-[10px] font-black tracking-widest border-b-2 transition-all pb-1 ${
                activeStage === s
                  ? "border-red-600 text-gray-900 dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              ETAP {s}
            </button>
          ))}
        </div>

        {/* Grupy dynamicznie z bazy */}
        <div className="flex space-x-6 h-8 items-center">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8" />
            ))
          ) : availableGroups.length > 0 ? (
            availableGroups.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`text-xs font-black min-w-[2rem] h-8 px-2 transition-all ${
                  activeGroup === g
                    ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {g}
              </button>
            ))
          ) : (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Brak grup w bazie
            </span>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <table className="w-full text-left text-xs uppercase tracking-wider font-bold">
          <thead className="border-b-2 border-gray-900 sticky top-0 z-10 dark:border-white">
            <tr>
              <th className="py-4 px-4 w-12">#</th>
              <th className="py-4">DRUŻYNA</th>
              <th className="py-4 text-center">B</th>
              <th className="py-4 text-right px-4">PKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
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
                  key={idx}
                  className={
                    idx < 2
                      ? "text-red-600"
                      : "text-gray-600 dark:text-gray-400"
                  }
                >
                  <td className="py-5 px-4">{idx + 1}</td>
                  <td className="py-5 font-black dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-5 text-center font-mono opacity-50">
                    {row.goals_for}:{row.goals_against}
                  </td>
                  <td className="py-5 text-right px-4 font-black dark:text-white">
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
