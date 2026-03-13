import { useState, useEffect } from "react";
import { getMatches } from "../../utils/data";
import { Skeleton } from "../Layout/Skeleton";

const ScheduleView = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination calculations
  const totalPages = Math.ceil(matches.length / itemsPerPage);
  const indexOfLastMatch = currentPage * itemsPerPage;
  const indexOfFirstMatch = indexOfLastMatch - itemsPerPage;
  const currentMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);

  return (
    <div className="h-full max-w-xl mx-auto flex flex-col py-6 px-4">
      <div className="text-center border-b-4 border-gray-900 pb-2 inline-block mx-auto w-full mb-12 flex-shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-widest">MECZE</h1>
      </div>

      <div className="flex-grow flex flex-col justify-between overflow-hidden pr-2">
        <div className="space-y-10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 flex-1" />
                </div>
                <Skeleton className="h-2 w-32 mx-auto" />
              </div>
            ))
          ) : currentMatches.length > 0 ? (
            currentMatches.map((match) => (
              <div key={match.id} className="text-center relative">
                {match.status === "live" && (
                   <div className="text-red-600 text-[10px] font-black tracking-widest mb-3">● NA ŻYWO</div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right text-xs font-black uppercase truncate">{match.home_team?.name}</div>
                  <div className="text-2xl font-black min-w-[100px] border-x border-gray-100 px-4 leading-none">
                    {match.score_home !== null ? `${match.score_home}:${match.score_away}` : "VS"}
                  </div>
                  <div className="flex-1 text-left text-xs font-black uppercase truncate">{match.away_team?.name}</div>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                  {match.scheduled_at ? (
                    <>
                      {new Date(match.scheduled_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                      {" | "}
                      {new Date(match.scheduled_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </>
                  ) : "TBD"}
                  {match.stage && ` — ${match.stage}`}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">BRAK MECZÓW</div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-8 py-6 border-t border-gray-100 mt-auto flex-shrink-0">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`text-[10px] font-black uppercase tracking-widest ${currentPage === 1 ? 'text-gray-200' : 'text-gray-900 hover:text-red-600'}`}
            >
              Poprzednie
            </button>
            <span className="text-[10px] font-bold text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`text-[10px] font-black uppercase tracking-widest ${currentPage === totalPages ? 'text-gray-200' : 'text-gray-900 hover:text-red-600'}`}
            >
              Następne
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;
