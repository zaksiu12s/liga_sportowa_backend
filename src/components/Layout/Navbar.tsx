import type { View } from "../../types/app";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLoginClick?: () => void;
}

const Navbar = ({ currentView, onNavigate, onLoginClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home" as const, label: "START" },
    { id: "schedule" as const, label: "MECZE" },
    { id: "standings" as const, label: "TABELE" },
    { id: "finals" as const, label: "FINAŁY" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = (view: View) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 md:py-4 max-w-none">
        <div
          className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter cursor-pointer hover:text-red-600 transition-none flex-shrink-0"
          onClick={() => handleNavClick("home")}
        >
          LIGA ELEKTRYKA
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 md:gap-8 items-center flex-1 justify-center px-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`font-black uppercase text-sm md:text-base tracking-tighter transition-none ${
                currentView === item.id
                  ? "text-red-600 border-b-4 border-red-600 pb-1"
                  : "text-black hover:text-red-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="material-symbols-outlined text-2xl text-black">
                account_circle
              </span>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-none"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button onClick={onLoginClick}>
              <span className="material-symbols-outlined text-2xl text-black">
                account_circle
              </span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button - On the right */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 ml-auto"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t-2 border-black bg-white">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-3 text-left font-black uppercase text-sm border-b border-gray-200 transition-none ${
                  currentView === item.id
                    ? "bg-red-600 text-white"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Mobile Auth in Menu */}
            <div className="border-t-2 border-black bg-gray-50">
              {user ? (
                <>
                  <div className="px-4 py-3 text-sm font-black uppercase text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined">account_circle</span>
                    ZALOGOWANY
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left font-black uppercase text-xs text-red-600 hover:bg-gray-200 transition-none"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left font-black uppercase text-xs text-black hover:bg-gray-200 transition-none flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">account_circle</span>
                  ZALOGUJ SIĘ
                </button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
