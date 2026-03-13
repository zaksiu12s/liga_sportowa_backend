import { useState, useEffect } from "react";
import { getMatches } from "../../utils/data";

const ScheduleView = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMatches();
        setMatches(data);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 animate-pulse font-bold text-gray-400 uppercase tracking-widest">Wczytywanie terminarza...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center md:text-left mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
          Terminarz <span className="text-red-600">Meczów</span>
        </h1>
        <p className="text-gray-500 mt-2">Przegląd nadchodzących i zakończonych spotkań.</p>
      </div>

      <div className="space-y-4">
        {matches.length > 0 ? matches.map((match) => (
          <div 
            key={match.id}
            className={`relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border transition-all ${
              match.status === "live" 
                ? "border-red-500 ring-2 ring-red-500/10 shadow-lg" 
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            {match.status === "live" && (
              <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl animate-pulse">
                NA ŻYWO
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Time/Info */}
              <div className="w-full md:w-24 text-center md:text-left">
                <span className={`text-xs font-black uppercase tracking-widest ${
                  match.status === "live" ? "text-red-600" : "text-gray-400"
                }`}>
                  {match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "TBD"}
                </span>
                <div className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
                  {match.rounds?.name || "Mecz"}
                </div>
              </div>

              {/* Matchup */}
              <div className="flex-grow flex items-center justify-center gap-4 md:gap-12 w-full">
                <div className="flex-1 text-right font-bold text-gray-900 md:text-lg">
                  {match.home_team?.name}
                </div>
                
                <div className={`px-4 py-2 rounded-xl font-black text-xl md:text-2xl min-w-[100px] text-center ${
                  match.status === "live" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-900"
                }`}>
                  {match.score_home !== null ? `${match.score_home} : ${match.score_away}` : "- : -"}
                </div>

                <div className="flex-1 text-left font-bold text-gray-900 md:text-lg">
                  {match.away_team?.name}
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 text-gray-400 italic bg-white rounded-2xl border border-gray-100">
            Brak zaplanowanych meczów w bazie.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
