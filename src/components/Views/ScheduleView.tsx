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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-[10px] font-bold tracking-widest text-gray-400">ŁADOWANIE...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-16">
      <div className="text-center border-b-4 border-gray-900 pb-2 inline-block mx-auto w-full mb-12">
        <h1 className="text-2xl font-black uppercase tracking-widest">MECZE</h1>
      </div>

      <div className="space-y-12">
        {matches.length > 0 ? matches.map((match) => (
          <div key={match.id} className="text-center relative">
            {match.status === "live" && (
               <div className="text-red-600 text-[10px] font-black tracking-widest mb-4">● NA ŻYWO</div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-right text-xs font-black uppercase truncate">{match.home_team?.name}</div>
              <div className="text-2xl font-black min-w-[100px] border-x border-gray-100 px-4">
                {match.score_home !== null ? `${match.score_home}:${match.score_away}` : "VS"}
              </div>
              <div className="flex-1 text-left text-xs font-black uppercase truncate">{match.away_team?.name}</div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
               {match.scheduled_at ? new Date(match.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "TBD"}
               {" — "}{match.rounds?.name}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">BRAK MECZÓW</div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
