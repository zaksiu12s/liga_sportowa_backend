import { useState, useEffect } from "react";
import supabase from "./utils/supabase";
import { Tables } from "./types/supabase";

function Page() {
  const [teams, setTeams] = useState<Tables<"teams">[]>([]);

  useEffect(() => {
    const getTeams = async () => {
      const { data, error } = await supabase.from("teams").select();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setTeams(data);
      }
    };

    getTeams();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Drużyny Ligi ZSEM</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <li key={team.id} className="border p-4 rounded shadow bg-white">
            <h2 className="text-xl font-semibold">{team.name}</h2>
            {team.short_name && <p className="text-gray-600">({team.short_name})</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Page;
