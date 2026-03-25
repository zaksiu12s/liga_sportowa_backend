import { useMemo } from "react";
import { Skeleton } from "../Layout/Skeleton";
import { usePublicData } from "../../hooks/usePublicData";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  class_code: string;
  school: string;
}

interface Team {
  id: string;
  name: string;
}

interface TeamWithPlayers extends Team {
  players: Player[];
}

interface GroupedTeams {
  [key: string]: TeamWithPlayers[];
}

const TeamsView = () => {
  const { data } = usePublicData();
  const loading = !data;

  const groupedTeams = useMemo<GroupedTeams>(() => {
    if (!data) return {};

    const teamToGroup: { [key: string]: string } = {};
    data.firstStageGroups.forEach((stage) => {
      if (stage.group_code && stage.teams?.teams) {
        stage.teams.teams.forEach((team) => {
          teamToGroup[team.id] = stage.group_code as string;
        });
      }
    });

    const playersMap = new Map<string, Player[]>();
    data.players.forEach((player) => {
      if (!player.team_id) return;

      if (!playersMap.has(player.team_id)) {
        playersMap.set(player.team_id, []);
      }

      playersMap.get(player.team_id)?.push({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        class_code: player.class_code,
        school: player.school,
      });
    });

    const teamsWithPlayers: TeamWithPlayers[] = data.teams.map((team: Team) => ({
      id: team.id,
      name: team.name,
      players: playersMap.get(team.id) || [],
    }));

    const grouped: GroupedTeams = {};
    teamsWithPlayers.forEach((team) => {
      const group = teamToGroup[team.id] || "A";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(team);
    });

    const sortedGroups: GroupedTeams = {};
    Object.keys(grouped)
      .sort()
      .forEach((group) => {
        sortedGroups[group] = grouped[group];
      });

    return sortedGroups;
  }, [data]);

  const groups = Object.keys(groupedTeams).sort();

  return (
    <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-3 md:mb-4">
          DRUŻYNY
        </h1>
        <div className="h-2 w-24 md:w-32 bg-black mb-6"></div>
        <span className="bg-black text-white px-4 py-2 font-black text-xs md:text-sm tracking-widest inline-block">
          SEZON 2026
        </span>
      </header>

      {/* Groups */}
      {loading ? (
        <div className="space-y-8 md:space-y-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-24 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-64" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-10 md:space-y-16">
          {groups.map((group) => (
            <section key={group}>
              {/* Group Header with Line */}
              <div className="flex items-center gap-0 mb-6 md:mb-8">
                <div className="bg-white text-black pr-4 py-2 md:pr-6 md:py-3 font-black text-xl md:text-base uppercase tracking-widest flex-shrink-0">
                  GRUPA {group}
                </div>
                <div className="flex-grow h-0.5 md:h-0.5 bg-black"></div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {groupedTeams[group].map((team) => (
                  <div
                    key={team.id}
                    className="border-4 border-black bg-white overflow-hidden"
                  >
                    {/* Team Header */}
                    <div className="bg-red-600 border-b-4 border-black p-4 md:p-6 flex justify-between items-center">
                      <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter text-white">
                        {team.name}
                      </h2>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="w-8 h-8 md:w-10 md:h-10"
                      >
                        <path
                          fill="#ffffff"
                          d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
                        />
                      </svg>
                    </div>

                    {/* Sekcja naglowka "Sklad Druzyny" celowo usunieta na prosbe uzytkownika. */}

                    {/* Players Grid */}
                    <div className="p-3 md:p-4">
                      {team.players.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {team.players
                            .sort((a, b) =>
                              `${a.first_name} ${a.last_name}`.localeCompare(
                                `${b.first_name} ${b.last_name}`
                              )
                            )
                            .map((player) => (
                              <div key={player.id} className="border-2 border-black">
                                {/* Player Row */}
                                <div className="flex items-center justify-between bg-white p-2 md:p-3">
                                  <div className="flex-grow">
                                    <span className="font-black text-xs md:text-sm uppercase truncate">
                                      {player.first_name} {player.last_name}
                                    </span>
                                  </div>
                                  <span className="ml-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-red-600 flex-shrink-0">
                                    {player.class_code || "BRAK KLASY"} | {player.school || "BRAK SZKOŁY"}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p className="font-black uppercase tracking-widest text-xs">
                            BRAK GRACZY
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="font-black uppercase tracking-widest">BRAK DRUŻYN</p>
        </div>
      )}
    </main>
  );
};

export default TeamsView;
