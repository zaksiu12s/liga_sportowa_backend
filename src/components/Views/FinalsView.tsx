import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { Skeleton } from "../Layout/Skeleton";

interface FinalMatch {
  id: number;
  type: string;
  home_team_id: string;
  away_team_id: string;
  score_home?: number;
  score_away?: number;
}

interface MatchData extends FinalMatch {
  home_team?: { name: string };
  away_team?: { name: string };
}

const FinalsView = () => {
  const [semifinals, setSemifinals] = useState<MatchData[]>([]);
  const [finalMatch, setFinalMatch] = useState<MatchData | null>(null);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinalStageData = async () => {
      try {
        setLoading(true);
        const { data, error } = await (supabase as any)
          .from("final_stage")
          .select(`
            *,
            home_team:teams!final_stage_home_team_id_fkey (name),
            away_team:teams!final_stage_away_team_id_fkey (name)
          `)
          .order("type", { ascending: true });

        if (error) throw error;

        const semifinalMatches = data?.filter(
          (m: any) => m.type?.includes("semi-final")
        ) || [];
        const final = data?.find((m: any) => m.type === "final") || null;
        const thirdPlace = data?.find((m: any) => m.type === "3rd-place") || null;

        setSemifinals(semifinalMatches as any);
        setFinalMatch(final as any);
        setThirdPlaceMatch(thirdPlace as any);
      } catch (err) {
        console.error("Error fetching final stage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinalStageData();
  }, []);

  const renderMatch = (match: MatchData | null, title: string) => {
    if (loading) {
      return (
        <div className="border-2 border-black bg-white p-0">
          <div className="border-b-2 border-black p-3 flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="p-3 flex justify-between items-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      );
    }

    if (!match) {
      return (
        <div className="border-2 border-black bg-gray-100 p-6 text-center text-gray-500">
          <p className="font-black uppercase">{title}</p>
        </div>
      );
    }

    return (
      <div className="border-2 border-black bg-white p-0">
        <div className="border-b-2 border-black p-3 flex justify-between items-center bg-gray-100">
          <span className="font-bold uppercase text-sm">{match.home_team?.name || "?"}</span>
          <span className="font-black text-xl">{match.score_home ?? "—"}</span>
        </div>
        <div className="p-3 flex justify-between items-center">
          <span className="font-bold uppercase text-sm">{match.away_team?.name || "?"}</span>
          <span className="font-black text-xl">{match.score_away ?? "—"}</span>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen pt-6 md:pt-12 pb-12 md:pb-24 px-3 md:px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-8 md:mb-16 border-l-4 md:border-l-8 border-black pl-3 md:pl-6">
        <h1 className="font-black text-4xl md:text-6xl lg:text-8xl uppercase tracking-tighter leading-none">
          FINAŁY <span className="text-red-600">LIGI</span>
        </h1>
        <p className="font-bold text-lg md:text-2xl mt-2 tracking-tight">FAZA PUCHAROWA SEZONU 2026</p>
      </header>

      {/* Knockout Bracket Visualization */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 relative pb-8 md:pb-12 overflow-x-auto">
        {/* Semifinals Column */}
        <div className="flex flex-col justify-around gap-8 md:gap-0 min-w-[300px] md:min-w-auto">
          <h2 className="font-black text-xl md:text-2xl uppercase mb-4 md:mb-0 border-b-2 md:border-b-4 border-black inline-block self-start px-2 pb-1 md:pb-2">
            PÓŁFINAŁY
          </h2>

          {semifinals.map((match, idx) => (
            <div key={match.id} className="relative py-4 md:py-8">
              {renderMatch(match, `SF${idx + 1}`)}
              <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-black"></div>
            </div>
          ))}
        </div>

        {/* Grand Final Column */}
        <div className="flex flex-col justify-center items-center py-8 md:py-0 min-w-[300px] md:min-w-auto relative">
          {/* Vertical Connectors */}
          <div className="hidden md:block absolute left-0 top-[25%] bottom-[25%] w-0.5 bg-black"></div>
          <div className="hidden md:block absolute left-0 top-1/2 w-8 h-0.5 bg-black"></div>

          <h2 className="font-black text-2xl md:text-3xl lg:text-4xl uppercase mb-6 md:mb-12 border-b-4 md:border-b-8 border-red-600 px-2 md:px-4 text-center pb-2 md:pb-4">
            WIELKI FINAŁ
          </h2>

          <div className="border-4 border-black bg-white p-0 w-full md:w-80">
            {loading ? (
              <div>
                <div className="bg-black text-white p-1 md:p-2 text-center text-xs font-black tracking-widest uppercase">
                  Mecz o Mistrzostwo
                </div>
                <div className="border-b-4 border-black p-3 md:p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                </div>
                <div className="p-3 md:p-6">
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ) : finalMatch ? (
              <>
                <div className="bg-black text-white p-1 md:p-2 text-center text-xs font-black tracking-widest uppercase">
                  Mecz o Mistrzostwo
                </div>
                <div className="border-b-4 border-black p-3 md:p-6 flex justify-between items-center gap-2">
                  <span className="font-black uppercase text-lg md:text-xl truncate">
                    {finalMatch.home_team?.name || "?"}
                  </span>
                  <span className="font-black text-3xl md:text-4xl flex-shrink-0">{finalMatch.score_home ?? "—"}</span>
                </div>
                <div className="p-3 md:p-6 flex justify-between items-center gap-2">
                  <span className="font-black uppercase text-lg md:text-xl truncate">
                    {finalMatch.away_team?.name || "?"}
                  </span>
                  <span className="font-black text-3xl md:text-4xl flex-shrink-0">{finalMatch.score_away ?? "—"}</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-black text-white p-1 md:p-2 text-center text-xs font-black tracking-widest uppercase">
                  Mecz o Mistrzostwo
                </div>
                <div className="p-3 md:p-6 text-center text-gray-500">
                  <p className="font-black uppercase text-xs md:text-sm">Czeka na zwycięzcę</p>
                </div>
              </>
            )}
            <div className="bg-red-600 p-2 md:p-4 text-center">
              <span className="text-white font-black text-sm md:text-lg uppercase tracking-widest">
                {!finalMatch?.score_home ? "CZEKA NA ZWYCIĘZCĘ" : "FINAŁ ZAKOŃCZONY"}
              </span>
            </div>
          </div>

          {/* Champion Spot */}
          <div className="mt-8 md:mt-20 flex flex-col items-center">
            <div className="w-16 h-16 md:w-24 md:h-24 border-4 border-red-600 flex items-center justify-center bg-white mb-2 md:mb-4">
              <span
                className="material-symbols-outlined text-red-600 text-4xl md:text-6xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emoji_events
              </span>
            </div>
            <div className="bg-red-600 text-white px-4 md:px-8 py-2 md:py-3 font-black text-lg md:text-2xl uppercase italic tracking-tighter">
              MISTRZ 2026
            </div>
          </div>
        </div>

        {/* 3rd Place Column */}
        <div className="flex flex-col justify-center gap-8 md:gap-12 min-w-[300px] md:min-w-auto md:pl-8 lg:pl-16">
          <div>
            <h2 className="font-black text-xl md:text-2xl uppercase mb-4 border-b-2 md:border-b-4 border-black inline-block px-2 pb-1 md:pb-2">
              O 3. MIEJSCE
            </h2>
            {renderMatch(thirdPlaceMatch, "3. MIEJSCE")}
          </div>
        </div>
      </section>
    </main>
  );
};

export default FinalsView;
