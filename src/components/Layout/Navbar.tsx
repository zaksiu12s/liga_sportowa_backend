import type { View } from "../../types/app";

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Navbar = ({ currentView, onNavigate }: NavbarProps) => {
  const navItems = [
    { id: "home", label: "START" },
    { id: "standings", label: "TABELE" },
    { id: "schedule", label: "MECZE" },
    { id: "finals", label: "FINAŁY" },
  ] as const;

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="font-black text-lg tracking-tight cursor-pointer"
          onClick={() => onNavigate("home")}
        >
          LIGA <span className="text-red-600">ZSEM</span>
        </div>
        
        <div className="flex space-x-4 md:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-xs font-bold tracking-widest ${
                currentView === item.id ? "text-red-600" : "text-gray-400 hover:text-gray-900"
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
