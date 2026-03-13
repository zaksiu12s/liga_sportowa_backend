import { useState, useEffect } from "react";
import { getMatches } from "../../utils/data";
import { Skeleton } from "../Layout/Skeleton";

const ScheduleView = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "finished">("upcoming");
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

  // Filtering and Sorting
  const filteredMatches = matches
    .filter(match => {
      if (activeFilter === "upcoming") return match.status === "scheduled" || match.status === "live";
      return match.status === "finished";
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_at || 0).getTime();
      const dateB = new Date(b.scheduled_at || 0).getTime();
      // Upcoming: Soonest first | Finished: Most recent first
      return activeFilter === "upcoming" ? dateA - dateB : dateB - dateA;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
  const indexOfLastMatch = currentPage * itemsPerPage;
  const indexOfFirstMatch = indexOfLastMatch - itemsPerPage;
  const currentMatches = filteredMatches.slice(indexOfFirstMatch, indexOfLastMatch);

  // Reset pagination on filter change
  const handleFilterChange = (filter: "upcoming" | "finished") => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="h-full max-w-xl mx-auto flex flex-col py-6 px-4">
      <div className="flex flex-col items-center gap-6 flex-shrink-0 mb-12">
        <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-gray-900 pb-2">MECZE</h1>
        
        {/* Filter Toggle */}
        <div className="flex space-x-12">
          {(["upcoming", "finished"] as const).map(f => (
            <button 
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`text-[10px] font-black tracking-widest border-b-2 transition-all pb-1 uppercase ${
                activeFilter === f ? "border-red-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-900"
              }`}
            >
              {f === "upcoming" ? "Nadchodzące" : "Zakończone"}
            </button>
          ))}
        </div>
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
