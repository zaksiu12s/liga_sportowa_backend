import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "START" },
  { path: "/teams", label: "DRUŻYNY" },
  { path: "/schedule", label: "MECZE" },
  { path: "/standings", label: "TABELE" },
  { path: "/finals", label: "FINAŁY" },
  { path: "/scorers", label: "STRZELCY" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b-2 border-black fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-6 py-3 md:py-4 max-w-none">
        <Link
          to="/"
          className="text-lg md:text-2xl font-black text-black uppercase tracking-tighter cursor-pointer hover:text-red-600 transition-none flex-shrink-0"
        >
          LIGA ELEKTRYKA
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 md:gap-8 items-center ml-auto justify-end pl-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-black uppercase text-sm md:text-base tracking-tighter transition-none ${isActivePath(item.path)
                  ? "text-red-600 border-b-4 border-red-600 pb-1"
                  : "text-black hover:text-red-600"
                }`}
            >
              {item.label}
            </Link>
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
                key={item.path}
                onClick={() => handleMobileNavClick(item.path)}
                className={`px-4 py-3 text-left font-black uppercase text-sm border-b border-gray-200 transition-none ${isActivePath(item.path)
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
