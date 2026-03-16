const HomeView2 = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col px-6 py-4 md:py-8 dark:text-white">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
        <div className="w-32 h-32 flex-shrink-0 bg-gray-900 flex items-center justify-center border-4 border-gray-900 overflow-hidden dark:bg-white dark:border-white">
          <img
            src={`${import.meta.env.BASE_URL}football_league_logo.jpg`}
            alt="LIGA LOGO"
            className="w-full h-full object-cover grayscale invert dark:invert-0"
          />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            LIGA <span className="text-red-600">ZSEM</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-400">
              Szkolna Liga Piłki Nożnej 2026
            </p>
            <span className="hidden md:block text-gray-300 dark:text-neutral-800">|</span>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              ZSEM & JCE NOWY SĄCZ
            </p>
          </div>
        </div>
      </header>

      {/* Intro Banner */}
      <section className="border-l-8 border-gray-900 pl-8 mb-12 max-w-2xl dark:border-white">
        <p className="text-xl md:text-2xl font-medium leading-tight text-gray-800 uppercase tracking-tight dark:text-gray-100">
          Oficjalne rozgrywki Zespołu Szkół Elektryczno-Mechanicznych oraz
          Jezuickiego Centrum Edukacji.
        </p>
      </section>

      {/* Player Zone / Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-gray-900 dark:border-neutral-800">
        {/* Step 1: Form */}
        <div className="group border-b-2 md:border-b-0 md:border-r-2 border-gray-900 p-8 flex flex-col justify-between hover:bg-red-600 dark:border-neutral-800 transition-colors">
          <div>
            <span className="text-6xl font-black text-gray-400/30 group-hover:text-white/40 dark:text-neutral-700 transition-colors">
              01
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white">
              Formularz Zgłoszeniowy
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-red-100 dark:text-gray-400">
              Pobierz i wypełnij oficjalną listę zawodników. Pamiętaj, że każda drużyna składa się z 10 osób, a formularz musi być podpisany przez wszystkich członków zespołu. To dokument zbiorczy dla całej ekipy.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}form.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-red-600 dark:border-white dark:hover:bg-white dark:hover:text-black"
          >
            Pobierz PDF
          </a>
        </div>

        {/* Step 2: Consent */}
        <div className="group border-b-2 md:border-b-0 md:border-r-2 border-gray-900 p-8 flex flex-col justify-between hover:bg-gray-900 dark:border-neutral-800 dark:hover:bg-white transition-colors">
          <div>
            <span className="text-6xl font-black text-gray-400/30 group-hover:text-white/20 dark:text-neutral-700 dark:group-hover:text-black/20 transition-colors">
              02
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white dark:group-hover:text-black">
              Zgoda na Uczestnictwo
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-gray-400 dark:text-gray-400 dark:group-hover:text-neutral-700">
              Każdy zawodnik (zarówno pełnoletni jak i niepełnoletni) zobowiązany jest dostarczyć podpisaną zgodę na udział w rozgrywkach. Jest to warunek konieczny do dopuszczenia do gry na boisku.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}consent.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-gray-900 dark:border-white dark:group-hover:border-black dark:group-hover:text-black dark:hover:bg-black dark:hover:!text-white"
          >
            Pobierz PDF
          </a>
        </div>

        {/* Step 3: Rules */}
        <div className="group p-8 flex flex-col justify-between hover:bg-red-600 transition-colors">
          <div>
            <span className="text-6xl font-black text-gray-400/30 group-hover:text-white/40 dark:text-neutral-700 transition-colors">
              03
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white">
              Regulamin Ligi
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-red-100 dark:text-gray-400">
              Zasady gry, system punktacji oraz kary dyscyplinarne. Nieznajomość regulaminu nie zwalnia z jego przestrzegania. Sprawdź format rozgrywek oraz wymagania dotyczące obuwia i stroju.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-red-600 dark:border-white dark:hover:bg-white dark:hover:text-black"
          >
            Czytaj Online
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeView2;
