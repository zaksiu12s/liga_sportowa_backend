import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HomeView1 from "./components/Views/HomeView1";
import HomeView2 from "./components/Views/HomeView2";
import StandingsView from "./components/Views/StandingsView";
import ScheduleView from "./components/Views/ScheduleView";
import FinalsView from "./components/Views/FinalsView";

function App() {
  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-hidden">
          <br />
          <Routes>
            <Route path="/" element={<HomeView1 />} />
            <Route path="/tabele" element={<StandingsView />} />
            <Route path="/mecze" element={<ScheduleView />} />
            <Route path="/finaly" element={<FinalsView />} />
            <Route path="/alternate" element={<HomeView2 />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
