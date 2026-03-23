import { useState, useEffect } from "react";
import { getMatches } from "../../utils/data";
import { Skeleton } from "../Layout/Skeleton";

const ScheduleView = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<"1" | "2" | "finals">("1");

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

  const filteredMatches = matches.filter((match) => {
    if (activeStage === "1") return match.stage === "first_stage";
    if (activeStage === "2") return match.stage === "second_stage";
    return match.stage?.includes("final");
  });

  const sortedMatches = filteredMatches.sort((a, b) => {
    const dateA = new Date(a.scheduled_at || 0).getTime();
    const dateB = new Date(b.scheduled_at || 0).getTime();
    return dateB - dateA;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
          TERMINARZ <span className="text-red-600">MECZÓW</span>
        </h1>
        <div className="h-2 w-32 bg-black"></div>
      </header>

      {/* Filter Section */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-0 border-2 border-black bg-white">
          <button
            onClick={() => setActiveStage("1")}
            className={`flex-1 py-4 px-6 font-black uppercase text-center border-r-2 border-black transition-none ${
              activeStage === "1"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            ETAP 1
          </button>
          <button
            onClick={() => setActiveStage("2")}
            className={`flex-1 py-4 px-6 font-black uppercase text-center border-r-2 border-black transition-none ${
              activeStage === "2"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            ETAP 2
          </button>
          <button
            onClick={() => setActiveStage("finals")}
            className={`flex-1 py-4 px-6 font-black uppercase text-center transition-none ${
              activeStage === "finals"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            FINAŁY
          </button>
        </div>
      </section>

      {/* Match List */}
      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-2 border-black bg-white">
              <div className="p-6 space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))
        ) : sortedMatches.length > 0 ? (
          sortedMatches.map((match) => (
            <div key={match.id} className="border-2 border-black bg-white overflow-hidden">
              {/* Match Status Header */}
              <div
                className={`px-4 py-1 flex justify-between items-center border-b-2 border-black ${
                  match.status === "live"
                    ? "bg-red-600 text-white"
                    : match.status === "finished"
                      ? "bg-gray-600 text-white"
                      : "bg-black text-white"
                }`}
              >
                <span className="font-black text-sm tracking-widest flex items-center gap-2">
                  {match.status === "live" && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                  {match.status === "live"
                    ? "NA ŻYWO"
                    : match.status === "finished"
                      ? "ZAKOŃCZONE"
                      : "ZAPLANOWANE"}
                </span>
                <span className="font-bold text-sm">
                  {match.scheduled_at
                    ? new Date(match.scheduled_at).toLocaleDateString(
                        "pl-PL",
                        { day: "2-digit", month: "2-digit", year: "numeric" },
                      )
                    : "TBD"}
                  {match.scheduled_at &&
                    ` | ${new Date(match.scheduled_at).toLocaleTimeString("pl-PL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </span>
              </div>

              {/* Match Content */}
              <div className={`p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 ${match.status === "finished" ? "grayscale opacity-75" : ""}`}>
                {/* Home Team */}
                <div className="flex-1 text-center md:text-right">
                  <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2">
                    {match.home_team?.name || "NIEZNANA"}
                  </h3>
                  <p className="text-outline font-bold uppercase tracking-wider text-sm">
                    GOSPODARZE
                  </p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  {match.score_home !== null ? (
                    <>
                      <div className="bg-black text-white w-20 h-24 md:w-28 md:h-32 flex items-center justify-center text-5xl md:text-7xl font-black border-2 border-black">
                        {match.score_home}
                      </div>
                      <div className="text-4xl font-black">:</div>
                      <div className="bg-black text-white w-20 h-24 md:w-28 md:h-32 flex items-center justify-center text-5xl md:text-7xl font-black border-2 border-black">
                        {match.score_away}
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-black bg-gray-100 px-6 py-2 border-2 border-black uppercase tracking-widest">
                      VS
                    </div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2">
                    {match.away_team?.name || "NIEZNANA"}
                  </h3>
                  <p className="text-outline font-bold uppercase tracking-wider text-sm">
                    GOŚCIE
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="font-black uppercase tracking-widest">BRAK MECZÓW</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default ScheduleView;
