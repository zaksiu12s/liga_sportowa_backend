import type { View } from "../../types/app";

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Navbar = ({ currentView, onNavigate }: NavbarProps) => {
  const navItems = [
    { id: "home", label: "Strona Główna" },
    { id: "standings", label: "Tabele/Rankingi" },
    { id: "schedule", label: "Terminarz" },
    { id: "finals", label: "Finały" },
  ] as const;

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="font-bold text-xl tracking-tight cursor-pointer hover:text-gray-300 transition-colors"
          onClick={() => onNavigate("home")}
        >
          Liga ZSEM <span className="text-red-600">2026</span>
        </div>
        
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`transition-all px-3 py-2 rounded-md font-medium text-sm ${
                currentView === item.id 
                ? "bg-gray-800 text-red-500 ring-1 ring-red-500/50" 
                : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile menu (simplified) */}
        <div className="md:hidden flex space-x-2 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                currentView === item.id ? "text-red-500 font-bold" : "text-gray-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
