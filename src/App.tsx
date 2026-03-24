import { useState } from "react";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HomeView from "./components/Views/HomeView";
import StandingsView from "./components/Views/StandingsView";
import ScheduleView from "./components/Views/ScheduleView";
import FinalsView from "./components/Views/FinalsView";
import TeamsView from "./components/Views/TeamsView";
import TopScorersPageView from "./components/Views/TopScorersView";
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
import type { View } from "./types/app";
import type { AdminView } from "./types/admin";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";

const viewToPath = (view: View) => {
  switch (view) {
    case "home":
      return "/";
    case "teams":
      return "/teams";
    case "schedule":
      return "/schedule";
    case "standings":
      return "/standings";
    case "finals":
      return "/finals";
    case "scorers":
      return "/scorers";
    default:
      return "/";
  }
};

const AdminRoute = ({ user, adminView, setAdminView }: {
  user: unknown;
  adminView: AdminView;
  setAdminView: React.Dispatch<React.SetStateAction<AdminView>>;
}) => {
  if (user) {
    return (
      <ProtectedRoute>
        <AdminLayout currentView={adminView} onViewChange={setAdminView}>
          {adminView === "dashboard" && <Dashboard onViewChange={setAdminView} />}
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b-2 border-black bg-white h-16 flex items-center px-4">
        <Link to="/" className="font-black text-lg tracking-tight cursor-pointer hover:text-red-600">
          ← BACK TO HOME
        </Link>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <Login />
      </div>
    </div>
  );
};

function App() {
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          path="/admin"
          element={<AdminRoute user={user} adminView={adminView} setAdminView={setAdminView} />}
        />
        <Route
          path="*"
          element={(
            <div className="bg-white min-h-screen flex flex-col text-on-surface overflow-x-hidden">
              <Navbar />
              <main className="flex-grow bg-white pt-[72px] md:pt-[84px]">
                <Routes>
                  <Route
                    path="/"
                    element={<HomeView onNavigate={(view) => navigate(viewToPath(view))} />}
                  />
                  <Route path="/standings" element={<StandingsView />} />
                  <Route path="/schedule" element={<ScheduleView />} />
                  <Route path="/finals" element={<FinalsView />} />
                  <Route path="/teams" element={<TeamsView />} />
                  <Route path="/scorers" element={<TopScorersPageView />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          )}
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
