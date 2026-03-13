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
        console.error("Error fetching standings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter standings based on stage and group
  const filteredStandings = standings.filter(item => {
    if (activeStage === 1) {
      // Stage 1: Filter by the 'group' column in the teams table
      return item.teams?.group === activeGroup;
    } else {
      // Stage 2: TOP 8 (To be implemented when 'stage' column is added to standings)
      // For now, it will be empty unless we have a way to identify Stage 2 teams
      return false; 
    }
  });

  if (loading) return <div className="text-center py-20 animate-pulse font-bold text-gray-400 uppercase tracking-widest">Wczytywanie tabeli...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Tabele i <span className="text-red-600">Rankingi</span>
        </h1>
        
        {/* Stage Toggle */}
        <div className="flex bg-gray-200 p-1 rounded-xl">
          <button 
            onClick={() => setActiveStage(1)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeStage === 1 ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Etap 1: Grupy
          </button>
          <button 
            onClick={() => setActiveStage(2)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeStage === 2 ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Etap 2: TOP 8
          </button>
        </div>
      </div>

      {/* Group Selection */}
      <div className="flex justify-center space-x-2">
        {(activeStage === 1 ? ["A", "B", "C"] : ["A", "B"]).map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`w-12 h-12 rounded-full font-bold transition-all border-2 ${
              activeGroup === group 
              ? "bg-gray-900 text-white border-gray-900" 
              : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 uppercase">Grupa {activeGroup}</h2>
          <span className="text-xs text-gray-400 font-medium tracking-widest">RANKING ZSEM 2026</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-white">
              <tr>
                <th className="px-6 py-4 font-medium">Poz.</th>
                <th className="px-6 py-4 font-medium">Drużyna</th>
                <th className="px-6 py-4 font-medium text-center">Mecze</th>
                <th className="px-6 py-4 font-medium text-center">Bramki</th>
                <th className="px-6 py-4 font-medium text-right">Punkty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStandings.length > 0 ? filteredStandings.map((row, idx) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50/50 transition-colors ${
                    idx < 2 ? "bg-red-50/10" : ""
                  }`}
                >
                  <td className="px-6 py-5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx < 2 ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-900">
                    {row.teams?.name || "Nieznana drużyna"}
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600 font-medium">{row.played}</td>
                  <td className="px-6 py-5 text-center font-mono text-xs text-gray-400">
                    {row.goals_for}:{row.goals_against}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-md font-black text-sm">
                      {row.points}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                    Brak danych dla tej grupy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span>Strefa awansu do kolejnego etapu</span>
        </div>
      </div>
    </div>
  );
};

export default StandingsView;
