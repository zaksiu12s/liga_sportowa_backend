import type { View } from "../../types/app";
import { useState } from "react";

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Navbar = ({ currentView, onNavigate }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home" as const, label: "START" },
    { id: "teams" as const, label: "DRUŻYNY" },
    { id: "schedule" as const, label: "MECZE" },
    { id: "standings" as const, label: "TABELE" },
    { id: "finals" as const, label: "FINAŁY" },
    { id: "scorers" as const, label: "STRZELCY" },

  ];

  const handleNavClick = (view: View) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b-2 border-black fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 md:py-4 max-w-none">
        <div
          className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter cursor-pointer hover:text-red-600 transition-none flex-shrink-0"
          onClick={() => handleNavClick("home")}
        >
          LIGA ELEKTRYKA
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 md:gap-8 items-center ml-auto justify-end pl-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`font-black uppercase text-sm md:text-base tracking-tighter transition-none ${currentView === item.id
                  ? "text-red-600 border-b-4 border-red-600 pb-1"
                  : "text-black hover:text-red-600"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

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
                className={`px-4 py-3 text-left font-black uppercase text-sm border-b border-gray-200 transition-none ${currentView === item.id
                    ? "bg-red-600 text-white"
                    : "text-black hover:bg-gray-100"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
