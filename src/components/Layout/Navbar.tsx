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
    { id: "home" as const, label: "START" },
    { id: "standings" as const, label: "TABELE" },
    { id: "schedule" as const, label: "MECZE" },
    { id: "finals" as const, label: "FINAŁY" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-none">
        <div
          className="text-2xl font-black text-black uppercase tracking-tighter cursor-pointer hover:text-red-600 transition-none"
          onClick={() => onNavigate("home")}
        >
          ZSEM/JCE
        </div>

        <nav className="hidden md:flex gap-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`font-black uppercase tracking-tighter transition-none ${
                currentView === item.id
                  ? "text-red-600 border-b-4 border-red-600 pb-1"
                  : "text-black hover:text-red-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="material-symbols-outlined text-2xl text-black">account_circle</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-none hidden md:inline-block"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="hidden md:flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-2xl text-black">account_circle</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
