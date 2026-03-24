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

function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const { user } = useAuth();
  const isAdminRoute = /^\/admin\/?$/.test(window.location.pathname);

  // Admin route
  if (isAdminRoute && user) {
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

  if (isAdminRoute && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="border-b-2 border-black bg-white h-16 flex items-center px-4">
          <a href={import.meta.env.BASE_URL} className="font-black text-lg tracking-tight cursor-pointer hover:text-red-600">
            ← BACK TO HOME
          </a>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <Login />
        </div>
      </div>
    );
  }

  // Public Views
  const renderView = () => {
    switch (currentView) {
      case "home":
        return <HomeView onNavigate={setCurrentView} />;
      case "standings":
        return <StandingsView />;
      case "schedule":
        return <ScheduleView />;
      case "finals":
        return <FinalsView />;
      case "teams":
        return <TeamsView />;
      case "scorers":
        return <TopScorersPageView />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col text-on-surface overflow-x-hidden">
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
        <main className="flex-grow bg-white pt-[72px] md:pt-[84px]">{renderView()}</main>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
