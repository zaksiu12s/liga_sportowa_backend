import type { View } from "../../types/app";
import { useAuth } from "../../hooks/useAuth";

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLoginClick?: () => void;
}

const Navbar = ({ currentView, onNavigate, onLoginClick }: NavbarProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: "home", label: "START" },
    { id: "standings", label: "STANDINGS" },
    { id: "schedule", label: "SCHEDULE" },
    { id: "finals", label: "FINALS" },
  ] as const;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate("home")}
        >
          <div className="font-black text-lg tracking-tight">
            LIGA <span className="text-red-600">ZSEM</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation Items */}
          <div className="flex space-x-4 md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-xs font-bold tracking-widest ${
                  currentView === item.id
                    ? "text-red-600"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l-2 border-black">
              <div className="text-xs font-semibold text-gray-600">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:border-red-600 transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-white text-black border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              ADMIN LOGIN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
