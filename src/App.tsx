import { useState } from "react";
// import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HomeView from "./components/Views/HomeView";
// import StandingsView from "./components/Views/StandingsView";
// import ScheduleView from "./components/Views/ScheduleView";
// import FinalsView from "./components/Views/FinalsView";
import type { View } from "./types/app";

function App() {
  const [currentView, setCurrentView] = useState<View>("home");

  const renderView = () => {
    switch (currentView) {
      // case "home":
      //   return <HomeView />;
      // case "standings":
      //   return <StandingsView />;
      // case "schedule":
      //   return <ScheduleView />;
      // case "finals":
      //   return <FinalsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900 overflow-hidden">
      <br />
      {/* <Navbar currentView={currentView} onNavigate={setCurrentView} /> */}
      <main className="flex-grow overflow-hidden">{renderView()}</main>
      <Footer />
    </div>
  );
}

export default App;
