import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  const navItems = [
    { id: "/", label: "START" },
    { id: "/tabele", label: "TABELE" },
    { id: "/mecze", label: "MECZE" },
    { id: "/finaly", label: "FINAŁY" },
  ] as const;

  return (
    <nav className="border-b border-gray-200 dark:border-neutral-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="font-black text-lg tracking-tight dark:text-white">
            LIGA <span className="text-red-600">ZSEM</span>
          </div>
        </Link>

        <div className="flex space-x-4 md:space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.id}
              className={({ isActive }) =>
                `text-xs font-bold tracking-widest transition-colors ${
                  isActive
                    ? "text-red-600"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
