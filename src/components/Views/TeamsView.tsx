import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import { Skeleton } from "../Layout/Skeleton";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  class_code: string;
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
  const [groupedTeams, setGroupedTeams] = useState<GroupedTeams>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamsAndPlayers = async () => {
      try {
        setLoading(true);

        // Fetch all teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("id, name");

        if (teamsError) throw teamsError;

        // Fetch all players
        const { data: playersData, error: playersError } = await (supabase as any)
          .from("players")
          .select("id, first_name, last_name, class_code, team_id");

        if (playersError) throw playersError;

        // Fetch all first_stage groups
        const { data: firstStageData } = await (supabase as any)
          .from("first_stage")
          .select("group_code, teams");

        // Build team ID to group mapping
        const teamToGroup: { [key: string]: string } = {};
        firstStageData?.forEach((stage: any) => {
          if (stage.teams?.teams) {
            stage.teams.teams.forEach((team: any) => {
              teamToGroup[team.id] = stage.group_code;
            });
          }
        });

        // Map players to teams
        const playersMap = new Map<string, Player[]>();
        playersData?.forEach((player: any) => {
          if (!playersMap.has(player.team_id)) {
            playersMap.set(player.team_id, []);
          }
          playersMap.get(player.team_id)?.push({
            id: player.id,
            first_name: player.first_name,
            last_name: player.last_name,
            class_code: player.class_code,
          });
        });

        // Combine teams with their players
        const teamsWithPlayers: TeamWithPlayers[] = (teamsData || []).map(
          (team: Team) => ({
            ...team,
            players: playersMap.get(team.id) || [],
          })
        );

        // Group teams by group code
        const grouped: GroupedTeams = {};
        teamsWithPlayers.forEach((team) => {
          const group = teamToGroup[team.id] || "A";
          if (!grouped[group]) {
            grouped[group] = [];
          }
          grouped[group].push(team);
        });

        // Sort groups
        const sortedGroups: GroupedTeams = {};
        Object.keys(grouped)
          .sort()
          .forEach((group) => {
            sortedGroups[group] = grouped[group];
          });

        setGroupedTeams(sortedGroups);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsAndPlayers();
  }, []);

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
                <div className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 font-black text-sm md:text-base uppercase tracking-widest border-4 border-red-600 flex-shrink-0">
                  GRUPA {group}
                </div>
                <div className="flex-grow h-1 md:h-2 bg-black"></div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {groupedTeams[group].map((team) => (
                  <div
                    key={team.id}
                    className="border-4 border-black bg-white overflow-hidden"
                  >
                    {/* Team Header */}
                    <div className="bg-white border-b-4 border-black p-4 md:p-6 flex justify-between items-center">
                      <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter">
                        {team.name}
                      </h2>
                      <span className="material-symbols-outlined text-3xl md:text-4xl font-black">
                        bolt
                      </span>
                    </div>

                    {/* Skład Drużyny Label */}
                    <div className="bg-white border-b-2 border-black p-3 md:p-4">
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest text-red-600">
                        Skład Drużyny
                      </p>
                    </div>

                    {/* Players Grid */}
                    <div className="p-3 md:p-4">
                      {team.players.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                          {team.players
                            .sort((a, b) =>
                              `${a.first_name} ${a.last_name}`.localeCompare(
                                `${b.first_name} ${b.last_name}`
                              )
                            )
                            .map((player, idx) => (
                              <div key={player.id} className="border-2 border-black">
                                {/* Player Row */}
                                <div className="flex items-center justify-between bg-white p-2 md:p-3">
                                  <div className="flex-grow">
                                    <span className="font-black text-xs md:text-sm uppercase truncate">
                                      {player.first_name[0]}. {player.last_name}
                                    </span>
                                  </div>
                                  <div className="ml-2 bg-red-600 text-white px-2 md:px-3 py-1 font-black text-xs uppercase tracking-widest flex-shrink-0">
                                    {String(idx + 1).padStart(2, "0")}
                                  </div>
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
