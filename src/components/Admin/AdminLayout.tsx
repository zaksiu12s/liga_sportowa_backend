import { useState, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { AdminView } from "../../types/admin";

interface AdminLayoutProps {
  children: ReactNode;
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
}

export const AdminLayout = ({
  children,
  currentView,
  onViewChange,
}: AdminLayoutProps) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: { label: string; view: AdminView }[] = [
    { label: "DASHBOARD", view: "dashboard" },
    { label: "TEAMS", view: "teams" },
    { label: "MATCHES", view: "matches" },
    { label: "PLAYERS", view: "players" },
    { label: "STAGES", view: "stages" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-black text-white border-r-2 border-black transition-all duration-300 flex flex-col`}
      >
        {/* Brand */}
        <div className="p-4 border-b-2 border-gray-700">
          {sidebarOpen && (
            <h1 className="text-xl font-black uppercase tracking-widest">ADMIN</h1>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 bg-white border-2 border-white"></div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full text-left px-4 py-3 mb-2 border-2 font-black text-xs uppercase tracking-widest transition-colors ${
                currentView === item.view
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-transparent border-gray-600 text-gray-400 hover:border-white hover:text-white"
              }`}
            >
              {sidebarOpen ? item.label : item.label.charAt(0)}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t-2 border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-white text-black border-2 border-white font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors"
          >
            {sidebarOpen ? "LOGOUT" : "◄"}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 text-white font-black text-xs hover:bg-gray-700"
          >
            {sidebarOpen ? "►" : "◄"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-black px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-black">
            {currentView.toUpperCase()} MANAGEMENT
          </h2>
          <div className="text-xs font-semibold text-gray-600">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
