import { useState, useEffect } from "react";
import { getTeamsCount, getMatchesCount, getNextMatch } from "../../utils/data";
import type { View } from "../../types/app";

interface NextMatchData {
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
  scheduled_at: string | null;
}

interface HomeViewProps {
  onNavigate?: (view: View) => void;
}

const HomeView = ({ onNavigate }: HomeViewProps) => {
  const [teamsCount, setTeamsCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [nextMatch, setNextMatch] = useState<NextMatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teams, matches, next] = await Promise.all([
          getTeamsCount(),
          getMatchesCount(),
          getNextMatch(),
        ]);
        setTeamsCount(teams);
        setMatchesCount(matches);
        setNextMatch(next);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("pl-PL", { weekday: "long" });
    const dateNum = date.getDate();
    const monthName = date.toLocaleDateString("pl-PL", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dayName.toUpperCase()} ${dateNum} ${monthName.toUpperCase()} ${year}, ${time}`;
  };

  return (
    <main className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-black mb-16 bg-white overflow-hidden">
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <span className="bg-red-600 text-white px-4 py-1 self-start font-bold text-sm tracking-widest mb-6">
            SEZON 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            LIGA <span className="text-red-600">ELEKTRYKA</span>
          </h1>
          <p className="text-lg md:text-xl font-bold border-l-8 border-black pl-6 max-w-2xl mb-10">
            NAJWIĘKSZE ROZGRYWKI SPORTOWE W REGIONIE. ARENA DLA TYCH, KTÓRZY NIE BOJĄ SIĘ WALKI O
            KAŻDY PUNKT.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate?.("schedule")}
              className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-black transition-none"
            >
              ZOBACZ MECZE
            </button>
          </div>
        </div>
        <div className="md:col-span-5 bg-black flex items-center justify-center p-0 overflow-hidden min-h-[400px]">
          <img
            className="w-full h-full object-cover grayscale contrast-150"
            alt="Czarno-białe zdjęcie stadionu sportowego"
            src={`https://www.fototapety.com/media/catalog/product/cache/296967dd00486cb8867f6b6fbb192224/w/0/w03239-small.jpg`}
          />
        </div>
      </section>

      {/* Next Match Teaser */}
      <section className="border-4 border-black bg-black text-white overflow-hidden mb-16">
        <div className="bg-white text-black p-4 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="block text-xs md:text-sm font-bold uppercase text-gray-500">GOSPODARZE</span>
              <span className="text-2xl md:text-3xl font-black uppercase">
                {loading ? "..." : nextMatch?.home_team?.name || "NIEZNANA"}
              </span>
            </div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black text-white flex items-center justify-center font-black text-3xl md:text-4xl flex-shrink-0">
              VS
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xs md:text-sm font-bold uppercase text-gray-500">GOŚCIE</span>
              <span className="text-2xl md:text-3xl font-black uppercase">
                {loading ? "..." : nextMatch?.away_team?.name || "NIEZNANA"}
              </span>
            </div>
          </div>
          <div className="text-center md:text-right w-full md:w-auto">
            <span className="block text-xs md:text-sm font-bold uppercase tracking-widest text-red-600">
              NAJBLIŻSZE SPOTKANIE
            </span>
            <span className="text-lg md:text-4xl font-black uppercase">
              {loading ? "..." : formatDateTime(nextMatch?.scheduled_at)}
            </span>
          </div>
        </div>
      </section>

      {/* Bento Grid Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* About Us Card */}
        <div className="md:col-span-2 border-2 border-black bg-white p-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <span className="w-12 h-12 bg-black text-white flex items-center justify-center material-symbols-outlined">
              info
            </span>
            O LIDZE
          </h2>
          <div className="space-y-4 font-body text-lg leading-relaxed">
            <p>
              Liga Elektryka to nie tylko turniej – to manifestacja sportowego ducha i rywalizacji na
              najwyższym poziomie technikum i liceum. Od lat łączymy pasję do sportu z profesjonalną
              organizacją.
            </p>
            <p>
              Naszym celem jest promowanie aktywności fizycznej oraz integracja społeczności
              uczniowskiej poprzez zdrowe współzawodnictwo. W tym roku wprowadzamy nową formułę
              rozgrywek i jeszcze wyższe standardy sędziowania.
            </p>
            <p>
              W tym sezonie czeka nas wiele emocji, a każda drużyna będzie walczyć o każdy punkt. Razem tworzymy historię Ligi Elektryka – dołącz do nas i bądź częścią tej niesamowitej przygody!
            </p>
            <p className="border-t-4 border-red-600 pt-4 mt-4">
              <span className="font-black text-red-600">WSPÓŁPRACA Z JCE</span> – Jezuickie Centrum Edukacji. Wspólnie tworzymy przestrzeń dla zdolnych sportowców i entuzjastów, gdzie sport łączy się z edukacją na najwyższym poziomie.
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="border-2 border-black bg-red-600 text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">W LICZBACH</h2>
            <div className="space-y-6">
              <div>
                <span className="text-6xl font-black block leading-none">
                  {loading ? "..." : teamsCount}
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">DRUŻYN</span>
              </div>
              <div className="border-t-2 border-white/30 pt-4">
                <span className="text-6xl font-black block leading-none">
                  {loading ? "..." : matchesCount}
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">MECZÓW</span>
              </div>
              <div className="border-t-2 border-white/30 pt-4">
                <span className="text-6xl font-black block leading-none">1</span>
                <span className="text-sm font-bold tracking-widest uppercase">MISTRZ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <section className="mb-16">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-center md:text-left">
          DOKUMENTY I PLIKI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            className="group border-2 border-black bg-white p-6 flex items-center justify-between hover:bg-black transition-none"
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl group-hover:text-white">
                description
              </span>
              <span className="font-black uppercase tracking-tight group-hover:text-white">
                Regulamin
              </span>
            </div>
            <span className="material-symbols-outlined group-hover:text-white">download</span>
          </a>
          <a
            className="group border-2 border-black bg-white p-6 flex items-center justify-between hover:bg-black transition-none"
            href={`${import.meta.env.BASE_URL}form.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl group-hover:text-white">
                edit_document
              </span>
              <span className="font-black uppercase tracking-tight group-hover:text-white">
                Formularz
              </span>
            </div>
            <span className="material-symbols-outlined group-hover:text-white">download</span>
          </a>
          <a
            className="group border-2 border-black bg-white p-6 flex items-center justify-between hover:bg-black transition-none"
            href={`${import.meta.env.BASE_URL}consent.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-4xl group-hover:text-white">
                assignment_turned_in
              </span>
              <span className="font-black uppercase tracking-tight group-hover:text-white">
                Zgoda
              </span>
            </div>
            <span className="material-symbols-outlined group-hover:text-white">download</span>
          </a>
        </div>
      </section>
    </main>
  );
};

export default HomeView;
