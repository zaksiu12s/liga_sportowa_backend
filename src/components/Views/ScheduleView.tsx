import { useMemo, useState } from "react";
import { Skeleton } from "../Layout/Skeleton";
import { usePublicData } from "../../hooks/usePublicData";
import type { PublicPlayer } from "../../types/publicData";

interface Goal {
  time: number;
  team_id: string;
  player_id: string;
}

const hasTwoPartName = (name: string | null | undefined) => {
  if (!name) return false;
  return name.trim().split(/\s+/).length >= 2;
};

const splitNameForBalancedWrap = (name: string | null | undefined) => {
  if (!name) return ["NIEZNANA", ""];

  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return [name, ""];

  const splitIndex = Math.ceil(parts.length / 2);
  return [parts.slice(0, splitIndex).join(" "), parts.slice(splitIndex).join(" ")];
};

const formatBalancedTeamName = (
  name: string | null | undefined,
  forceTwoLines: boolean,
) => {
  if (!name) return "NIEZNANA";
  if (!forceTwoLines) return name;

  const [lineOne, lineTwo] = splitNameForBalancedWrap(name);
  return `${lineOne}\n${lineTwo}`;
};

const formatMatchDateCompact = (scheduledAt: string | null | undefined) => {
  if (!scheduledAt) return "TBD";

  return new Date(scheduledAt).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatMatchWeekday = (scheduledAt: string | null | undefined) => {
  if (!scheduledAt) return "TBD";

  return new Date(scheduledAt)
    .toLocaleDateString("pl-PL", { weekday: "long" })
    .toUpperCase();
};

const formatMatchTime = (scheduledAt: string | null | undefined) => {
  if (!scheduledAt) return "--:--";

  return new Date(scheduledAt).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ScheduleView = () => {
  const { data } = usePublicData();
  const [activeStage, setActiveStage] = useState<"1" | "2" | "finals">("1");
  const [activeMatchFilter, setActiveMatchFilter] = useState<"planned" | "finished">("planned");
  const [showNextMatchLineups, setShowNextMatchLineups] = useState(false);
  const loading = !data;
  const matches = data?.matches || [];
  const players = data?.players || [];

  const allPlayers = useMemo(
    () => new Map<string, PublicPlayer>(players.map((player) => [player.id, player])),
    [players]
  );

  const stageMatches = matches.filter((match) => {
    if (activeStage === "1") return match.stage === "first_stage";
    if (activeStage === "2") return match.stage === "second_stage";
    return match.stage?.includes("final");
  });

  const plannedMatches = stageMatches.filter((match) => match.status !== "finished");
  const finishedMatches = stageMatches.filter((match) => match.status === "finished");

  const sortedPlannedMatches = [...plannedMatches].sort((a, b) => {
    const dateA = new Date(a.scheduled_at || 0).getTime();
    const dateB = new Date(b.scheduled_at || 0).getTime();
    return dateA - dateB;
  });

  const sortedFinishedMatches = [...finishedMatches].sort((a, b) => {
    const dateA = new Date(a.scheduled_at || 0).getTime();
    const dateB = new Date(b.scheduled_at || 0).getTime();
    return dateB - dateA;
  });

  const nextMatch = sortedPlannedMatches.find((m) => m.status === "scheduled") || null;
  const otherPlannedMatches = sortedPlannedMatches.filter((m) => m.id !== nextMatch?.id);
  const hasActiveMatches =
    activeMatchFilter === "planned"
      ? sortedPlannedMatches.length > 0
      : sortedFinishedMatches.length > 0;

  const homePlayers = players.filter((player) => player.team_id === nextMatch?.home_team_id);
  const awayPlayers = players.filter((player) => player.team_id === nextMatch?.away_team_id);
  const forceNextMatchTwoLineNames = hasTwoPartName(nextMatch?.home_team?.name) && hasTwoPartName(nextMatch?.away_team?.name);

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-3 md:mb-4">
          TERMINARZ <span className="text-red-600">MECZÓW</span>
        </h1>
        <div className="h-2 w-24 md:w-32 bg-black mb-6"></div>
        <span className="bg-black text-white px-4 py-2 font-black text-xs md:text-sm tracking-widest inline-block">
          SEZON 2026
        </span>
      </header>

      {/* Filter Section */}
      <section className="mb-8 md:mb-12">
        <div className="flex flex-wrap gap-0 border-2 border-black bg-white">
          <button
            onClick={() => setActiveStage("1")}
            className={`flex-1 min-w-[60px] py-3 md:py-4 px-3 md:px-6 font-black uppercase text-xs md:text-sm text-center border-r-2 border-black transition-none ${activeStage === "1"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
              }`}
          >
            ETAP 1
          </button>
          <button
            onClick={() => setActiveStage("2")}
            className={`flex-1 min-w-[60px] py-3 md:py-4 px-3 md:px-6 font-black uppercase text-xs md:text-sm text-center border-r-2 border-black transition-none ${activeStage === "2"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
              }`}
          >
            ETAP 2
          </button>
          <button
            onClick={() => setActiveStage("finals")}
            className={`flex-1 min-w-[60px] py-3 md:py-4 px-3 md:px-6 font-black uppercase text-xs md:text-sm text-center transition-none ${activeStage === "finals"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-gray-100"
              }`}
          >
            FINAŁY
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-0 border-2 border-black bg-white">
          <button
            onClick={() => setActiveMatchFilter("planned")}
            className={`flex-1 min-w-[180px] py-2 md:py-3 px-3 md:px-6 font-black uppercase text-xs md:text-sm text-center border-r-2 border-black transition-none ${activeMatchFilter === "planned"
              ? "bg-red-600 text-white"
              : "bg-white text-black hover:bg-gray-100"
              }`}
          >
            MECZE ZAPLANOWANE
          </button>
          <button
            onClick={() => setActiveMatchFilter("finished")}
            className={`flex-1 min-w-[180px] py-2 md:py-3 px-3 md:px-6 font-black uppercase text-xs md:text-sm text-center transition-none ${activeMatchFilter === "finished"
              ? "bg-gray-600 text-white"
              : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
          >
            MECZE ZAKOŃCZONE
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
        ) : hasActiveMatches ? (
          <>
            {/* Next Match - Special Design */}
            {activeMatchFilter === "planned" && nextMatch && (
              <div className="border-4 border-black bg-white overflow-hidden">
                {/* Header */}
                <div
                  className={`px-4 py-3 flex justify-between items-center border-b-2 border-black font-black uppercase tracking-widest text-sm ${nextMatch.status === "live"
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
                  <span className="text-sm">{formatMatchWeekday(nextMatch.scheduled_at)}</span>
                </div>

                {/* Match Display */}
                <div className="p-4 md:p-10">
                  {nextMatch.status === "scheduled" && (
                    <div className="flex justify-center mb-4 md:mb-6">
                      <span className="bg-red-600 text-white border-2 border-black px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-lg font-black tracking-widest leading-none whitespace-nowrap text-center">
                        {`${formatMatchDateCompact(nextMatch.scheduled_at)} | ${formatMatchTime(nextMatch.scheduled_at)}`}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8 mb-5 md:mb-8 pt-1 md:pt-0">
                    <div className="min-w-0 text-center md:text-right">
                      <div className="text-xl md:text-4xl font-black uppercase tracking-tighter leading-tight break-words min-h-[3rem] md:min-h-[5.5rem] flex items-center justify-center md:justify-end">
                        <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2 break-words min-h-[3rem] md:min-h-[6.5rem] flex items-center justify-center md:justify-end">
                          <span className="whitespace-pre-line">
                            {formatBalancedTeamName(nextMatch.home_team?.name, forceNextMatchTwoLineNames)}
                          </span>
                        </h3>
                      </div>
                      <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-red-600">
                        GOSPODARZE
                      </div>
                    </div>

                    {nextMatch.score_home !== null && nextMatch.score_away !== null ? (
                      <div className="flex items-center justify-center gap-2 md:gap-4 flex-shrink-0 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-black text-white flex items-center justify-center">
                          <span className="text-2xl md:text-4xl font-black">{nextMatch.score_home}</span>
                        </div>
                        <div className="text-xl md:text-3xl font-black">:</div>
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-black text-white flex items-center justify-center">
                          <span className="text-2xl md:text-4xl font-black">{nextMatch.score_away}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-24 md:h-24 mx-auto border-2 border-black flex items-center justify-center bg-black text-white text-2xl md:text-4xl font-black tracking-widest">
                        VS
                      </div>
                    )}

                    <div className="min-w-0 text-center md:text-left">
                      <div className="text-xl md:text-4xl font-black uppercase tracking-tighter leading-tight break-words min-h-[3rem] md:min-h-[5.5rem] flex items-center justify-center md:justify-start">
                        <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2 break-words min-h-[3rem] md:min-h-[6.5rem] flex items-center justify-center md:justify-end"><span className="whitespace-pre-line">
                          {formatBalancedTeamName(nextMatch.away_team?.name, forceNextMatchTwoLineNames)}
                        </span></h3>
                      </div>
                      <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-red-600">
                        GOŚCIE
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mb-4 md:mb-6">
                    <button
                      type="button"
                      onClick={() => setShowNextMatchLineups((prev) => !prev)}
                      className="border-2 border-black bg-white hover:bg-red-600 hover:text-white px-4 md:px-6 py-2 font-black uppercase text-xs md:text-sm tracking-widest"
                    >
                      {showNextMatchLineups ? "UKRYJ SKŁADY" : "ZOBACZ SKŁADY"}
                    </button>
                  </div>

                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-hidden transition-all duration-300 ${showNextMatchLineups ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="border-2 border-black bg-white">
                      <div className="bg-red-600 text-white px-3 py-2 text-xs md:text-sm font-black uppercase tracking-widest">
                        SKŁAD DRUŻYNY - GOSPODARZE
                      </div>
                      <div className="p-3 md:p-4 space-y-2">
                        {homePlayers.length > 0 ? (
                          homePlayers.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1"
                            >
                              <span className="text-sm md:text-base font-bold text-gray-900 truncate">
                                {player.first_name} {player.last_name}
                              </span>
                              <span className="text-xs md:text-sm font-black text-red-600 flex-shrink-0">
                                {player.class_code}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">Brak zawodników</p>
                        )}
                      </div>
                    </div>

                    <div className="border-2 border-black bg-white">
                      <div className="bg-red-600 text-white px-3 py-2 text-xs md:text-sm font-black uppercase tracking-widest">
                        SKŁAD DRUŻYNY - GOŚCIE
                      </div>
                      <div className="p-3 md:p-4 space-y-2">
                        {awayPlayers.length > 0 ? (
                          awayPlayers.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1"
                            >
                              <span className="text-sm md:text-base font-bold text-gray-900 truncate">
                                {player.first_name} {player.last_name}
                              </span>
                              <span className="text-xs md:text-sm font-black text-red-600 flex-shrink-0">
                                {player.class_code}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">Brak zawodników</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Finished Matches Section */}
            {activeMatchFilter === "finished" && sortedFinishedMatches.length > 0 && (
              <div>
                {sortedFinishedMatches.map((match) => {
                  return (
                    <div
                      key={match.id}
                      className="border-2 border-black bg-white overflow-hidden mb-4 md:mb-6"
                    >
                      {/* Header */}
                      <div className="px-3 md:px-4 py-2 flex justify-between items-center border-b-2 border-black font-black uppercase tracking-widest text-xs md:text-sm bg-gray-600 text-white gap-2">
                        <span className="flex-shrink-0">ZAKOŃCZONE</span>
                        <span className="text-xs md:text-sm text-right">
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
                      <div className="p-4 md:p-10">
                        {/* Score Line */}
                        <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between mb-6 md:mb-8 pb-6 md:pb-8 border-b-2 border-black gap-4 md:gap-2">
                          <div className="w-full md:flex-1 min-w-0 text-center md:text-left">
                            <h3 className="text-xl md:text-3xl font-black uppercase leading-tight break-words">
                              {match.home_team?.name || "NIEZNANA"}
                            </h3>
                            <p className="text-xs md:text-sm font-bold uppercase text-gray-600 tracking-wider">
                              GOSPODARZE
                            </p>
                          </div>
                          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                            <div className="bg-black text-white w-16 h-16 md:w-24 md:h-28 flex items-center justify-center text-3xl md:text-6xl font-black">
                              {match.score_home}
                            </div>
                            <div className="text-2xl md:text-3xl font-black">:</div>
                            <div className="bg-black text-white w-16 h-16 md:w-24 md:h-28 flex items-center justify-center text-3xl md:text-6xl font-black">
                              {match.score_away}
                            </div>
                          </div>
                          <div className="w-full md:flex-1 text-center md:text-right min-w-0">
                            <h3 className="text-xl md:text-3xl font-black uppercase leading-tight break-words">
                              {match.away_team?.name || "NIEZNANA"}
                            </h3>
                            <p className="text-xs md:text-sm font-bold uppercase text-gray-600 tracking-wider">
                              GOŚCIE
                            </p>
                          </div>
                        </div>

                        {/* Goal Scorers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                          {/* Home Team Scorers */}
                          <div>
                            <h4 className="text-xs md:text-sm font-black uppercase tracking-widest mb-2 md:mb-3 border-b-2 border-black pb-1 md:pb-2">
                              Strzelcy {match.home_team?.name}
                            </h4>
                            {match.goal_scorers?.goals &&
                              match.goal_scorers.goals.filter(
                                (g: Goal) => g.team_id === match.home_team_id
                              ).length > 0 ? (
                              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                                {match.goal_scorers.goals
                                  .filter((g: Goal) => g.team_id === match.home_team_id)
                                  .sort((a: Goal, b: Goal) => a.time - b.time)
                                  .map((goal: Goal, idx: number) => {
                                    const player = allPlayers.get(goal.player_id);
                                    return (
                                      <li
                                        key={idx}
                                        className="flex justify-between items-center gap-2"
                                      >
                                        <span className="font-bold truncate">
                                          {player
                                            ? `${player.first_name} ${player.last_name}`
                                            : "Nieznany"}
                                        </span>
                                        <span className="text-gray-600 font-bold flex-shrink-0">
                                          {goal.time}'
                                        </span>
                                      </li>
                                    );
                                  })}
                              </ul>
                            ) : (
                              <p className="text-gray-400 text-xs md:text-sm italic">
                                Brak strzelców
                              </p>
                            )}
                          </div>

                          {/* Away Team Scorers */}
                          <div>
                            <h4 className="text-xs md:text-sm font-black uppercase tracking-widest mb-2 md:mb-3 border-b-2 border-black pb-1 md:pb-2">
                              Strzelcy {match.away_team?.name}
                            </h4>
                            {match.goal_scorers?.goals &&
                              match.goal_scorers.goals.filter(
                                (g: Goal) => g.team_id === match.away_team_id
                              ).length > 0 ? (
                              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                                {match.goal_scorers.goals
                                  .filter((g: Goal) => g.team_id === match.away_team_id)
                                  .sort((a: Goal, b: Goal) => a.time - b.time)
                                  .map((goal: Goal, idx: number) => {
                                    const player = allPlayers.get(goal.player_id);
                                    return (
                                      <li
                                        key={idx}
                                        className="flex justify-between items-center gap-2"
                                      >
                                        <span className="font-bold truncate">
                                          {player
                                            ? `${player.first_name} ${player.last_name}`
                                            : "Nieznany"}
                                        </span>
                                        <span className="text-gray-600 font-bold flex-shrink-0">
                                          {goal.time}'
                                        </span>
                                      </li>
                                    );
                                  })}
                              </ul>
                            ) : (
                              <p className="text-gray-400 text-xs md:text-sm italic">
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
            {activeMatchFilter === "planned" && otherPlannedMatches.map((match) => (
              <div
                key={match.id}
                className="border-2 border-black bg-white overflow-hidden"
              >
                {/* Header */}
                <div className={`px-4 py-2 flex justify-between items-center border-b-2 border-black font-black uppercase tracking-widest text-xs md:text-sm ${match.status === "live"
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
                  <span className="text-xs">{formatMatchWeekday(match.scheduled_at)}</span>
                </div>

                {/* Match Content */}
                {match.status === "scheduled" && (
                  <div className="px-6 md:px-10 pt-4 md:pt-5 flex justify-center">
                    <span className="bg-black text-white border-2 border-black px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-lg font-black tracking-widest leading-none whitespace-nowrap text-center">
                      {`${formatMatchDateCompact(match.scheduled_at)} | ${formatMatchTime(match.scheduled_at)}`}
                    </span>
                  </div>
                )}

                <div
                  className={`p-6 md:p-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 ${match.status === "finished" ? "grayscale opacity-75" : ""
                    }`}
                >
                  {/* Home Team */}
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2 break-words min-h-[3rem] md:min-h-[6.5rem] flex items-center justify-center md:justify-end">
                      <span className="whitespace-pre-line">
                        {formatBalancedTeamName(
                          match.home_team?.name,
                          hasTwoPartName(match.home_team?.name) && hasTwoPartName(match.away_team?.name),
                        )}
                      </span>
                    </h3>
                    <p className="text-outline font-bold uppercase tracking-wider text-sm">
                      GOSPODARZE
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center gap-4 w-full md:w-auto md:min-w-[180px] mx-auto">
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
                      <div className="w-16 h-16 md:w-24 md:h-24 mx-auto border-2 border-black flex items-center justify-center bg-black text-white text-2xl md:text-4xl font-black tracking-widest">
                        VS
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-2 break-words min-h-[3rem] md:min-h-[6.5rem] flex items-center justify-center md:justify-start">
                      <span className="whitespace-pre-line">
                        {formatBalancedTeamName(
                          match.away_team?.name,
                          hasTwoPartName(match.home_team?.name) && hasTwoPartName(match.away_team?.name),
                        )}
                      </span>
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
