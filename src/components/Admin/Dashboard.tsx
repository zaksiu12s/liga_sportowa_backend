import { useEffect, useState } from "react";
import { matchesApi } from "../../utils/adminSupabase";
import type { Match } from "../../types/admin";

export const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const matchesData = await matchesApi.getAll();
        setMatches(matchesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates (polling every 5 seconds)
    const unsubMatches = matchesApi.subscribe(setMatches);

    return () => {
      unsubMatches();
    };
  }, []);

  const activeMatches = matches.filter((m) => m.status === "live").length;
  const finishedMatches = matches.filter((m) => m.status === "finished").length;

  const stats = [
    {
      label: "TOTAL MATCHES",
      value: matches.length,
      color: "bg-white border-black text-black",
    },
    {
      label: "SCHEDULED MATCHES",
      value: matches.filter((m) => m.status === "scheduled").length,
      color: "bg-blue-100 border-blue-600 text-blue-900",
    },
    {
      label: "ACTIVE MATCHES",
      value: activeMatches,
      color: "bg-red-100 border-red-600 text-red-900",
    },
    {
      label: "FINISHED MATCHES",
      value: finishedMatches,
      color: "bg-green-100 border-green-600 text-green-900",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-black border-r-transparent animate-spin mb-4"></div>
          <p className="font-black uppercase text-sm tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} border-2 p-6 text-center`}
          >
            <div className="text-xs font-black uppercase tracking-widest mb-2">
              {stat.label}
            </div>
            <div className="text-4xl font-black">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-2 border-black p-8">
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-4">
          QUICK ACTIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickActionButton label="+ ADD TEAM" />
          <QuickActionButton label="+ SCHEDULE MATCH" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border-2 border-black p-8">
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-4">
          MATCH STATUS
        </h3>

        {/* Matches Stats */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest mb-4">
            MATCHES STATUS
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-100 border-2 border-gray-300 p-4 text-center">
              <div className="text-2xl font-black">
                {matches.filter((m) => m.status === "scheduled").length}
              </div>
              <div className="text-xs font-bold uppercase mt-2">Scheduled</div>
            </div>
            <div className="bg-red-100 border-2 border-red-600 p-4 text-center">
              <div className="text-2xl font-black text-red-900">
                {activeMatches}
              </div>
              <div className="text-xs font-bold uppercase text-red-900 mt-2">
                Live
              </div>
            </div>
            <div className="bg-green-100 border-2 border-green-600 p-4 text-center">
              <div className="text-2xl font-black text-green-900">
                {finishedMatches}
              </div>
              <div className="text-xs font-bold uppercase text-green-900 mt-2">
                Finished
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label }: { label: string }) => (
  <button className="px-6 py-4 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
    {label}
  </button>
);
