import { useState } from "react";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HomeView from "./components/Views/HomeView";
import StandingsView from "./components/Views/StandingsView";
import ScheduleView from "./components/Views/ScheduleView";
import FinalsView from "./components/Views/FinalsView";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { Dashboard } from "./components/Admin/Dashboard";
import { TeamsTable } from "./components/Admin/Teams/TeamsTable";
import { MatchesTable } from "./components/Admin/Matches/MatchesTable";
import { ToastContainer } from "./components/Admin/Toast";
import { useAuth } from "./hooks/useAuth";
import type { View } from "./types/app";
import type { AdminView } from "./types/admin";

function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();

  // Admin Panel View
  if (user) {
    return (
      <ProtectedRoute>
        <AdminLayout currentView={adminView} onViewChange={setAdminView}>
          {adminView === "dashboard" && <Dashboard />}
          {adminView === "teams" && <TeamsTable />}
          {adminView === "matches" && <MatchesTable />}
        </AdminLayout>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  // Login View
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="border-b-2 border-black bg-white h-16 flex items-center px-4">
          <button
            onClick={() => setShowLogin(false)}
            className="font-black text-lg tracking-tight cursor-pointer hover:text-red-600"
          >
            ← BACK TO HOME
          </button>
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
        return <HomeView />;
      case "standings":
        return <StandingsView />;
      case "schedule":
        return <ScheduleView />;
      case "finals":
        return <FinalsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900 overflow-hidden">
        <Navbar
          currentView={currentView}
          onNavigate={setCurrentView}
          onLoginClick={() => setShowLogin(true)}
        />
        <main className="flex-grow overflow-hidden">{renderView()}</main>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
