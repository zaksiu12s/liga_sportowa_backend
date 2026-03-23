import { useState } from "react";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { Dashboard } from "./components/Admin/Dashboard";
import { TeamsTable } from "./components/Admin/Teams/TeamsTable";
import { MatchesView } from "./components/Admin/Matches/MatchesView";
import { PlayersTable } from "./components/Admin/Players/PlayersTable";
import { StagesView } from "./components/Admin/Stages/StagesView";
import { TopScorersView } from "./components/Admin/Statistics/TopScorersView";
import { ToastContainer } from "./components/Admin/Toast";
import { useAuth } from "./hooks/useAuth";
import type { AdminView } from "./types/admin";

function App() {
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const { user } = useAuth();

  if (user) {
    return (
      <ProtectedRoute>
        <AdminLayout currentView={adminView} onViewChange={setAdminView}>
          {adminView === "dashboard" && (
            <Dashboard onViewChange={setAdminView} />
          )}
          {adminView === "teams" && <TeamsTable />}
          {adminView === "matches" && <MatchesView />}
          {adminView === "players" && <PlayersTable />}
          {adminView === "stages" && <StagesView />}
          {adminView === "top-scorers" && <TopScorersView />}
        </AdminLayout>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Login />
      <ToastContainer />
    </div>
  );
}

export default App;
