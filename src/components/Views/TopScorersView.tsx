import { useMemo } from "react";
import { Skeleton } from "../Layout/Skeleton";
import { usePublicData } from "../../hooks/usePublicData";

interface Scorer {
  id: string;
  player_id: string;
  player_name: string;
  team_id: string;
  team_name: string;
  goals: number;
}

interface ScorerWithRank extends Scorer {
  rank: number;
}

const TopScorersPageView = () => {
  const { data } = usePublicData();
  const loading = !data;

  const scorers = useMemo<ScorerWithRank[]>(
    () => (data?.topScorers || []).map((scorer: Scorer, idx: number) => ({ ...scorer, rank: idx + 1 })),
    [data?.topScorers]
  );

  const topScorer = scorers.length > 0 ? scorers[0] : null;

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-3 md:mb-4">
          KRÓL <span className="text-red-600">STRZELCÓW</span>
        </h1>
        <div className="h-2 w-24 md:w-32 bg-black mb-6"></div>
        <span className="bg-red-600 text-white px-4 py-2 font-black text-xs md:text-sm tracking-widest inline-block">
          SEZON 2026
        </span>
      </header>

      {/* Top Scorer Card */}
      {loading ? (
        <div className="border-4 border-black bg-white overflow-hidden mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="bg-gray-200 h-[300px] md:h-[400px] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-6 md:p-12 flex flex-col justify-center">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      ) : topScorer ? (
        <div className="border-4 border-black bg-white overflow-hidden mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-black h-[300px] md:h-[400px] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: "120px" }}
              >
                sports_soccer
              </span>
            </div>

            {/* Info */}
            <div className="p-6 md:p-12 flex flex-col justify-center border-l-4 border-black">
              <span className="bg-red-600 text-white px-3 py-1 font-black text-xs tracking-widest inline-block mb-4 self-start">
                LIDER RANKINGU
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
                {topScorer.player_name}
              </h2>
              <p className="text-lg md:text-2xl font-bold uppercase text-red-600 mb-6">
                {topScorer.team_name}
              </p>
              <div className="flex items-center gap-8 md:gap-12">
                <div>
                  <div className="text-5xl md:text-7xl font-black">
                    {topScorer.goals}
                  </div>
                  <div className="text-xs md:text-sm font-black uppercase tracking-widest text-gray-600">
                    GOLE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-4 border-black bg-gray-100 p-8 rounded text-center mb-8 md:mb-12">
          <p className="font-black uppercase text-gray-500">BRAK DANYCH</p>
        </div>
      )}

      {/* Top 10 Scorers Table */}
      <section>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">
          TOP 10 STRZELCÓW
        </h2>

        {loading ? (
          <div className="border-2 border-black bg-white overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-b-2 border-black p-4 md:p-6 flex items-center gap-4 md:gap-8"
              >
                <Skeleton className="w-12 h-8" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        ) : scorers.length > 0 ? (
          <div className="border-2 border-black bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-0 border-b-4 border-black bg-black text-white">
              <div className="col-span-1 p-3 md:p-4 font-black text-center text-xs md:text-sm uppercase tracking-widest border-r-2 border-white">
                POZ
              </div>
              <div className="col-span-5 p-3 md:p-4 font-black text-xs md:text-sm uppercase tracking-widest border-r-2 border-white">
                ZAWODNIK
              </div>
              <div className="col-span-4 p-3 md:p-4 font-black text-xs md:text-sm uppercase tracking-widest border-r-2 border-white">
                DRUŻYNA
              </div>
              <div className="col-span-2 p-3 md:p-4 font-black text-xs md:text-sm text-center uppercase tracking-widest">
                G
              </div>
            </div>

            {/* Table Rows */}
            {scorers.map((scorer) => (
              <div
                key={scorer.id}
                className={`grid grid-cols-12 gap-0 border-b border-gray-200 ${
                  scorer.rank === 1 ? "bg-red-50" : "bg-white"
                }`}
              >
                <div className={`col-span-1 p-3 md:p-4 font-black text-center text-sm md:text-base border-r border-gray-300 ${scorer.rank === 1 ? "bg-red-600 text-white" : ""}`}>
                  {String(scorer.rank).padStart(2, "0")}
                </div>
                <div className="col-span-5 p-3 md:p-4 font-bold text-sm md:text-base uppercase border-r border-gray-300 truncate">
                  {scorer.player_name}
                </div>
                <div className="col-span-4 p-3 md:p-4 text-xs md:text-sm uppercase border-r border-gray-300 truncate text-gray-700">
                  {scorer.team_name}
                </div>
                <div className="col-span-2 p-3 md:p-4 font-black text-center text-sm md:text-base">
                  {scorer.goals}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-black bg-gray-100 p-8 text-center">
            <p className="font-black uppercase text-gray-500">BRAK DANYCH</p>
          </div>
        )}
      </section>

      {/* Total Goals Summary */}
      {scorers.length > 0 && (
        <div className="mt-8 md:mt-12 bg-white text-black p-6 md:p-8 border-4 border-black">
          <div className="text-center">
            <p className="text-xs md:text-sm font-black uppercase tracking-widest mb-2">
              SUMA GOLI
            </p>
            <p className="text-5xl md:text-6xl font-black">
              {scorers.reduce((sum, s) => sum + s.goals, 0)}
            </p>
            <p className="text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
              WSZYSTKICH STRZELCÓW W TOP 10
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default TopScorersPageView;
