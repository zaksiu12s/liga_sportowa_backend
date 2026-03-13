import { useState, useEffect } from "react";
import { getStandings } from "../../utils/data";
import type { Tables } from "../../types/supabase";

type StandingWithTeam = Tables<"standings"> & {
  teams: { 
    name: string; 
    short_name: string | null; 
    logo_path: string | null;
    group: string | null;
  } | null;
};

const StandingsView = () => {
  const [activeStage, setActiveStage] = useState<1 | 2>(1);
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const [standings, setStandings] = useState<StandingWithTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getStandings();
        setStandings(data as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStandings = standings.filter(item => {
    if (activeStage === 1) return item.teams?.group === activeGroup;
    return false; 
  });

  if (loading) return <div className="text-center py-20 text-[10px] font-bold tracking-widest text-gray-400">ŁADOWANIE...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-gray-900 pb-2">TABELE</h1>
        
        <div className="flex space-x-12">
          {[1, 2].map(s => (
            <button 
              key={s}
              onClick={() => setActiveStage(s as 1 | 2)}
              className={`text-[10px] font-black tracking-widest border-b-2 transition-all pb-1 ${
                activeStage === s ? "border-red-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              ETAP {s}
            </button>
          ))}
        </div>

        <div className="flex space-x-6">
          {(activeStage === 1 ? ["A", "B", "C"] : ["A", "B"]).map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`text-xs font-black w-8 h-8 ${
                activeGroup === g ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs uppercase tracking-wider font-bold">
          <thead className="border-b-2 border-gray-900">
            <tr>
              <th className="py-4 px-4 w-12">#</th>
              <th className="py-4">DRUŻYNA</th>
              <th className="py-4 text-center">M</th>
              <th className="py-4 text-center">B</th>
              <th className="py-4 text-right px-4">PKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStandings.length > 0 ? filteredStandings.map((row, idx) => (
              <tr key={row.id} className={idx < 2 ? "text-red-600" : "text-gray-600"}>
                <td className="py-5 px-4">{idx + 1}</td>
                <td className="py-5 font-black">{row.teams?.name}</td>
                <td className="py-5 text-center">{row.played}</td>
                <td className="py-5 text-center font-mono opacity-50">{row.goals_for}:{row.goals_against}</td>
                <td className="py-5 text-right px-4 font-black">{row.points}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-20 text-center text-gray-400">BRAK DANYCH</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsView;
