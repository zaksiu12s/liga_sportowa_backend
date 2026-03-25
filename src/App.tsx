import { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HomeView from "./components/Views/HomeView";
import StandingsView from "./components/Views/StandingsView";
import ScheduleView from "./components/Views/ScheduleView";
import FinalsView from "./components/Views/FinalsView";
import TeamsView from "./components/Views/TeamsView";
import TopScorersPageView from "./components/Views/TopScorersView";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { AdminLayout } from "./components/Admin/AdminLayout";
import { Dashboard } from "./components/Admin/Dashboard";
import { TeamsTable } from "./components/Admin/Teams/TeamsTable";
import { MatchesView } from "./components/Admin/Matches/MatchesView";
import { PlayersTable } from "./components/Admin/Players/PlayersTable";
import { StagesView } from "./components/Admin/Stages/StagesView";
import { TopScorersView } from "./components/Admin/Statistics/TopScorersView";
import { ToastContainer } from "./components/Admin/Toast";
import { NavigationVisibilityView } from "./components/Admin/NavigationVisibilityView";
import { useAuth } from "./hooks/useAuth";
import { usePublicData } from "./hooks/usePublicData";
import { PublicDataProvider } from "./context/PublicDataContext";
import type { View } from "./types/app";
import type { AdminView } from "./types/admin";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const viewToPath = (view: View) => {
  switch (view) {
    case "home":
      return "/";
    case "teams":
      return "/teams";
    case "schedule":
      return "/schedule";
    case "standings":
      return "/standings";
    case "finals":
      return "/finals";
    case "scorers":
      return "/scorers";
    default:
      return "/";
  }
};

const AdminRoute = ({
  user,
  adminView,
  setAdminView,
}: {
  user: unknown;
  adminView: AdminView;
  setAdminView: React.Dispatch<React.SetStateAction<AdminView>>;
}) => {
  if (user) {
    return (
      <ProtectedRoute>
        <AdminLayout currentView={adminView} onViewChange={setAdminView}>
          {adminView === "dashboard" && (
            <Dashboard onViewChange={setAdminView} />
          )}
          {adminView === "teams" && <TeamsTable />}
          {adminView === "matches" && <MatchesView />}
          {adminView === "players" && <PlayersTable />}
          {adminView === "stages" && <StagesView />}
          {adminView === "top-scorers" && <TopScorersView />}
          {adminView === "navigation" && <NavigationVisibilityView />}
        </AdminLayout>
        <ToastContainer />
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b-2 border-black bg-white h-16 flex items-center px-4">
        <Link
          to="/"
          className="font-black text-lg tracking-tight cursor-pointer hover:text-red-600"
        >
          Powrót do Strony Głównej
        </Link>
      </div>
      <div className="flex-grow flex items-center justify-center">
        <Login />
      </div>
    </div>
  );
};

const PublicRouteContent = ({
  transitionStage,
  handleRouteAnimationEnd,
  displayLocation,
  navigate,
}: {
  transitionStage: "route-fade-in" | "route-fade-out";
  handleRouteAnimationEnd: () => void;
  displayLocation: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const { status, errorMessage, syncNow, showHydrationFade, isSwappingData } =
    usePublicData();

  if (status === "blocking-load") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="border-4 border-black bg-white p-8 sm:p-10 text-center shadow-[10px_10px_0px_#dc2626] max-w-md w-full">
          <div
            className="inline-block w-12 h-12 border-4 border-black border-r-transparent animate-spin mb-5"
            aria-hidden="true"
          ></div>
          <h1 className="font-black uppercase text-xl tracking-wide">
            Ladowanie Danych
          </h1>
          <p className="mt-3 text-sm font-bold text-gray-600 uppercase tracking-wider">
            Pierwsze uruchomienie aplikacji
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="border-4 border-black bg-white p-8 sm:p-10 text-center shadow-[10px_10px_0px_#dc2626] max-w-lg w-full">
          <h1 className="font-black uppercase text-2xl tracking-tight">
            Brak Danych Startowych
          </h1>
          <p className="mt-4 text-sm font-bold text-gray-700">
            {errorMessage || "Nie mozna uruchomic aplikacji w trybie online."}
          </p>
          <button
            type="button"
            onClick={() => void syncNow()}
            className="mt-6 px-6 py-3 border-2 border-black bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-500"
          >
            Sprobuj Ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col text-on-surface overflow-x-hidden relative">
      {showHydrationFade && (
        <div className="app-hydration-overlay" aria-hidden="true" />
      )}
      <Navbar />
      <main className="flex-grow bg-white pt-[72px] md:pt-[84px]">
        <div
          className={`${transitionStage} ${isSwappingData ? "data-swap-in" : ""}`}
          onAnimationEnd={handleRouteAnimationEnd}
        >
          <Routes location={displayLocation}>
            <Route
              path="/"
              element={
                <HomeView onNavigate={(view) => navigate(viewToPath(view))} />
              }
            />
            <Route path="/standings" element={<StandingsView />} />
            <Route path="/schedule" element={<ScheduleView />} />
            <Route path="/finals" element={<FinalsView />} />
            <Route path="/teams" element={<TeamsView />} />
            <Route path="/scorers" element={<TopScorersPageView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  const [isKonamiModalOpen, setIsKonamiModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<
    "route-fade-in" | "route-fade-out"
  >("route-fade-in");
  const transitionTimeoutRef = useRef<number | null>(null);
  const konamiIndexRef = useRef(0);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        setDisplayLocation(location);
        setTransitionStage("route-fade-in");
        return;
      }

      setTransitionStage("route-fade-out");

      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      // Fallback: ensure route changes even if animation events are skipped.
      transitionTimeoutRef.current = window.setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("route-fade-in");
        transitionTimeoutRef.current = null;
      }, 560);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [displayLocation.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expectedKey = KONAMI_SEQUENCE[konamiIndexRef.current];

      if (pressedKey === expectedKey) {
        konamiIndexRef.current += 1;

        if (konamiIndexRef.current === KONAMI_SEQUENCE.length) {
          setIsKonamiModalOpen(true);
          konamiIndexRef.current = 0;
        }

        return;
      }

      konamiIndexRef.current = pressedKey === KONAMI_SEQUENCE[0] ? 1 : 0;
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRouteAnimationEnd = () => {
    if (transitionStage === "route-fade-out") {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      setDisplayLocation(location);
      setTransitionStage("route-fade-in");
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute
              user={user}
              adminView={adminView}
              setAdminView={setAdminView}
            />
          }
        />
        <Route
          path="*"
          element={
            <PublicDataProvider>
              <PublicRouteContent
                transitionStage={transitionStage}
                handleRouteAnimationEnd={handleRouteAnimationEnd}
                displayLocation={displayLocation}
                navigate={navigate}
              />
            </PublicDataProvider>
          }
        />
      </Routes>
      {isKonamiModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center px-4">
          <div className="w-full max-w-3xl bg-white border-4 border-black shadow-[10px_10px_0px_#dc2626]">
            <div className="flex items-center justify-between border-b-4 border-black px-4 py-3">
              <h2 className="font-black uppercase tracking-widest text-sm md:text-base">
                UKRYTY TRYB ODBLOKOWANY
              </h2>
              <button
                type="button"
                onClick={() => setIsKonamiModalOpen(false)}
                className="border-2 border-black px-3 py-1 font-black text-xs uppercase"
              >
                Zamknij
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="relative w-full overflow-hidden border-2 border-black" style={{ paddingTop: "56.25%" }}>
                <iframe
                  title="Konami secret"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noreferrer"
                className="inline-block border-2 border-black bg-black text-white px-4 py-2 font-black text-xs uppercase tracking-widest"
              >
                GOTCH YA! ;P
              </a>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default App;
