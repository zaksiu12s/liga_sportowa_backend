import { useState, useEffect } from "react";
import { getMatches } from "../../utils/data";
import supabase from "../../utils/supabase";
import { Skeleton } from "../Layout/Skeleton";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  class_code: string;
}

interface Goal {
  time: number;
  team_id: string;
  player_id: string;
}

const ScheduleView = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<"1" | "2" | "finals" | "finished">("1");
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Map<string, Player>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getMatches();
        setMatches(data);

        // Fetch all players for goal scorer lookup
        const { data: playersData } = await (supabase as any)
          .from("players")
          .select("id, first_name, last_name, class_code");

        if (playersData) {
          const playerMap = new Map<string, Player>(
            playersData.map((p: Player) => [p.id, p])
          );
          setAllPlayers(playerMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMatches = matches.filter((match) => {
    if (activeStage === "finished") return match.status === "finished";
    if (activeStage === "1") return match.stage === "first_stage";
    if (activeStage === "2") return match.stage === "second_stage";
    return match.stage?.includes("final");
  });

  const sortedMatches = filteredMatches.sort((a, b) => {
    const dateA = new Date(a.scheduled_at || 0).getTime();
    const dateB = new Date(b.scheduled_at || 0).getTime();
    return dateA - dateB;
  });

  // Find the next (closest) match only if not viewing finished matches
  const nextMatch =
    activeStage !== "finished"
      ? sortedMatches.find((m) => m.status === "scheduled")
      : null;
  const otherMatches = sortedMatches.filter(
    (m) => m.id !== nextMatch?.id && m.status !== "finished"
  );

  // Fetch players for the next match
  useEffect(() => {
    if (!nextMatch) return;

    const fetchPlayers = async () => {
      try {
        // Fetch home team players
        const { data: homeData } = await (supabase as any)
          .from("players")
          .select("id, first_name, last_name, class_code")
          .eq("team_id", nextMatch.home_team_id);

        // Fetch away team players
        const { data: awayData } = await (supabase as any)
          .from("players")
          .select("id, first_name, last_name, class_code")
          .eq("team_id", nextMatch.away_team_id);

        setHomePlayers(homeData || []);
        setAwayPlayers(awayData || []);
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };

    fetchPlayers();
  }, [nextMatch]);

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
          <>
            {/* Next Match - Special Design */}
            {nextMatch && (
              <div className="border-4 border-black bg-white overflow-hidden">
                {/* Header */}
                <div
                  className={`px-4 py-3 flex justify-between items-center font-black uppercase tracking-widest text-sm ${
                    nextMatch.status === "live"
                      ? "bg-red-600 text-white"
                      : nextMatch.status === "finished"
                        ? "bg-gray-600 text-white"
                        : "bg-red-600 text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {nextMatch.status === "live" && (
                      <span className="text-2xl">●</span>
                    )}
                    {nextMatch.status === "live"
                      ? "LIVE"
                      : nextMatch.status === "finished"
                        ? "ZAKOŃCZONE"
                        : "NASTĘPNE SPOTKANIE"}
                  </span>
                  <span className="text-sm">
                    {nextMatch.scheduled_at
                      ? new Date(nextMatch.scheduled_at).toLocaleDateString(
                          "pl-PL",
                          {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        ) +
                        " | " +
                        new Date(nextMatch.scheduled_at).toLocaleTimeString(
                          "pl-PL",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "TBD"}
                  </span>
                </div>

                {/* Match Display */}
                <div className="p-8 md:p-12 flex flex-col items-center justify-center">
                  {/* Teams and Score */}
                  <div className="flex items-center justify-center gap-6 md:gap-8 w-full mb-8">
                    {/* Home Team */}
                    <div className="text-right flex-1">
                      <div className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-2">
                        {nextMatch.home_team?.name || "NIEZNANA"}
                      </div>
                      <div className="text-xs font-bold uppercase text-gray-600 tracking-widest mb-4">
                        GOSPODARZE
                      </div>
                      {/* Home Team Players */}
                      <div className="text-xs space-y-1">
                        {homePlayers.map((player) => (
                          <div key={player.id} className="text-gray-700">
                            {player.first_name} {player.last_name}{" "}
                            <span className="font-bold text-gray-500">({player.class_code})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Score */}
                    {nextMatch.score_home !== null && nextMatch.score_away !== null ? (
                      <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-black text-white flex items-center justify-center">
                          <span className="text-4xl md:text-5xl font-black">
                            {nextMatch.score_home}
                          </span>
                        </div>
                        <div className="text-xl md:text-2xl font-black">:</div>
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-black text-white flex items-center justify-center">
                          <span className="text-4xl md:text-5xl font-black">
                            {nextMatch.score_away}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 md:px-6">
                        <div className="text-2xl md:text-3xl font-black">VS</div>
                      </div>
                    )}

                    {/* Away Team */}
                    <div className="text-left flex-1">
                      <div className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-2">
                        {nextMatch.away_team?.name || "NIEZNANA"}
                      </div>
                      <div className="text-xs font-bold uppercase text-gray-600 tracking-widest mb-4">
                        GOŚCIE
                      </div>
                      {/* Away Team Players */}
                      <div className="text-xs space-y-1">
                        {awayPlayers.map((player) => (
                          <div key={player.id} className="text-gray-700">
                            {player.first_name} {player.last_name}{" "}
                            <span className="font-bold text-gray-500">({player.class_code})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Finished Matches Section */}
            {sortedMatches.filter((m) => m.status === "finished").length > 0 && (
              <div className="mt-16 pt-12 border-t-4 border-black">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8">
                  MECZE <span className="text-gray-500">ZAKOŃCZONE</span>
                </h2>
                {sortedMatches
                  .filter((m) => m.status === "finished")
                  .map((match) => {
                    return (
                      <div
                        key={match.id}
                        className="border-2 border-black bg-white overflow-hidden mb-6"
                      >
                        {/* Header */}
                        <div className="px-4 py-2 flex justify-between items-center border-b-2 border-black font-black uppercase tracking-widest text-xs md:text-sm bg-gray-600 text-white">
                          <span>ZAKOŃCZONE</span>
                          <span className="text-xs">
                            {match.scheduled_at
                              ? new Date(match.scheduled_at).toLocaleDateString(
                                  "pl-PL",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  },
                                ) +
                                " | " +
                                new Date(match.scheduled_at).toLocaleTimeString(
                                  "pl-PL",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "TBD"}
                          </span>
                        </div>

                        {/* Match Content */}
                        <div className="p-6 md:p-10">
                          {/* Score Line */}
                          <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-black">
                            <div className="flex-1">
                              <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight">
                                {match.home_team?.name || "NIEZNANA"}
                              </h3>
                              <p className="text-sm font-bold uppercase text-gray-600 tracking-wider">
                                GOSPODARZE
                              </p>
                            </div>
                            <div className="flex items-center gap-4 mx-4">
                              <div className="bg-black text-white w-20 h-24 md:w-24 md:h-28 flex items-center justify-center text-5xl md:text-6xl font-black">
                                {match.score_home}
                              </div>
                              <div className="text-3xl font-black">:</div>
                              <div className="bg-black text-white w-20 h-24 md:w-24 md:h-28 flex items-center justify-center text-5xl md:text-6xl font-black">
                                {match.score_away}
                              </div>
                            </div>
                            <div className="flex-1 text-right">
                              <h3 className="text-2xl md:text-3xl font-black uppercase leading-tight">
                                {match.away_team?.name || "NIEZNANA"}
                              </h3>
                              <p className="text-sm font-bold uppercase text-gray-600 tracking-wider">
                                GOŚCIE
                              </p>
                            </div>
                          </div>

                        {/* Goal Scorers */}
                          <div className="grid grid-cols-2 gap-8">
                            {/* Home Team Scorers */}
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
                                Strzelcy {match.home_team?.name}
                              </h4>
                              {match.goal_scorers?.goals &&
                              match.goal_scorers.goals.filter(
                                (g: Goal) => g.team_id === match.home_team_id
                              ).length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                  {match.goal_scorers.goals
                                    .filter((g: Goal) => g.team_id === match.home_team_id)
                                    .sort((a: Goal, b: Goal) => a.time - b.time)
                                    .map((goal: Goal, idx: number) => {
                                      const player = allPlayers.get(goal.player_id);
                                      return (
                                        <li
                                          key={idx}
                                          className="flex justify-between items-center"
                                        >
                                          <span className="font-bold">
                                            {player
                                              ? `${player.first_name} ${player.last_name}`
                                              : "Nieznany"}
                                          </span>
                                          <span className="text-gray-600 font-bold">
                                            {goal.time}'
                                          </span>
                                        </li>
                                      );
                                    })}
                                </ul>
                              ) : (
                                <p className="text-gray-400 text-sm italic">
                                  Brak strzelców
                                </p>
                              )}
                            </div>

                            {/* Away Team Scorers */}
                            <div>
                              <h4 className="text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
                                Strzelcy {match.away_team?.name}
                              </h4>
                              {match.goal_scorers?.goals &&
                              match.goal_scorers.goals.filter(
                                (g: Goal) => g.team_id === match.away_team_id
                              ).length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                  {match.goal_scorers.goals
                                    .filter((g: Goal) => g.team_id === match.away_team_id)
                                    .sort((a: Goal, b: Goal) => a.time - b.time)
                                    .map((goal: Goal, idx: number) => {
                                      const player = allPlayers.get(goal.player_id);
                                      return (
                                        <li
                                          key={idx}
                                          className="flex justify-between items-center"
                                        >
                                          <span className="font-bold">
                                            {player
                                              ? `${player.first_name} ${player.last_name}`
                                              : "Nieznany"}
                                          </span>
                                          <span className="text-gray-600 font-bold">
                                            {goal.time}'
                                          </span>
                                        </li>
                                      );
                                    })}
                                </ul>
                              ) : (
                                <p className="text-gray-400 text-sm italic">
                                  Brak strzelców
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Other Matches - Simple Design */}
            {otherMatches.map((match) => (
              <div
                key={match.id}
                className="border-2 border-black bg-white overflow-hidden"
              >
                {/* Header */}
                <div
                  className={`px-4 py-2 flex justify-between items-center border-b-2 border-black font-black uppercase tracking-widest text-xs md:text-sm ${
                    match.status === "live"
                      ? "bg-red-600 text-white"
                      : match.status === "finished"
                        ? "bg-gray-600 text-white"
                        : "bg-black text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {match.status === "live" && (
                      <span className="text-xl">●</span>
                    )}
                    {match.status === "live"
                      ? "NA ŻYWO"
                      : match.status === "finished"
                        ? "ZAKOŃCZONE"
                        : "ZAPLANOWANE"}
                  </span>
                  <span className="text-xs">
                    {match.scheduled_at
                      ? new Date(match.scheduled_at).toLocaleDateString(
                          "pl-PL",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          },
                        ) +
                        " | " +
                        new Date(match.scheduled_at).toLocaleTimeString(
                          "pl-PL",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "TBD"}
                  </span>
                </div>

                {/* Match Content */}
                <div
                  className={`p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 ${
                    match.status === "finished" ? "grayscale opacity-75" : ""
                  }`}
                >
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
            ))}
          </>
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
