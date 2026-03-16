const HomeView2 = () => {
  return (
    <div className="max-w-4xl mx-auto flex flex-col px-6 py-4 md:py-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
        <div className="w-32 h-32 flex-shrink-0 bg-gray-900 flex items-center justify-center border-4 border-gray-900 overflow-hidden">
          <img
            src={`${import.meta.env.BASE_URL}football_league_logo.jpg`}
            alt="LIGA LOGO"
            className="w-full h-full object-cover grayscale invert"
          />
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            LIGA <span className="text-red-600">ZSEM</span>
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">
              Szkolna Liga Piłki Nożnej 2026
            </p>
            <span className="hidden md:block text-gray-300">|</span>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              ZSEM & JCE NOWY SĄCZ
            </p>
          </div>
        </div>
      </header>

      {/* Intro Banner */}
      <section className="border-l-8 border-gray-900 pl-8 mb-12 max-w-2xl">
        <p className="text-xl md:text-2xl font-medium leading-tight text-gray-800 uppercase tracking-tight">
          Oficjalne rozgrywki Zespołu Szkół Elektryczno-Mechanicznych oraz
          Jezuickiego Centrum Edukacji.
        </p>
      </section>

      {/* Player Zone / Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-gray-900">
        {/* Step 1: Form */}
        <div className="group border-b-2 md:border-b-0 md:border-r-2 border-gray-900 p-8 flex flex-col justify-between hover:bg-red-600">
          <div>
            <span className="text-6xl font-black text-gray-200 group-hover:text-white/30">
              01
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white">
              Formularz Zgłoszeniowy
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-red-100">
              Wypełnij listę zawodników swojej drużyny. Wymagany podpis każdego
              uczestnika.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}form.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-red-600"
          >
            Pobierz PDF
          </a>
        </div>

        {/* Step 2: Consent */}
        <div className="group border-b-2 md:border-b-0 md:border-r-2 border-gray-900 p-8 flex flex-col justify-between hover:bg-gray-900">
          <div>
            <span className="text-6xl font-black text-gray-200 group-hover:text-white/10">
              02
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white">
              Zgoda Rodziców
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-gray-400">
              Każdy niepełnoletni zawodnik musi dostarczyć indywidualną zgodę
              opiekuna.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}consent.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-gray-900"
          >
            Pobierz PDF
          </a>
        </div>

        {/* Step 3: Rules */}
        <div className="group p-8 flex flex-col justify-between hover:bg-red-600">
          <div>
            <span className="text-6xl font-black text-gray-200 group-hover:text-white/30">
              03
            </span>
            <h3 className="text-xl font-black uppercase tracking-tighter mt-4 group-hover:text-white">
              Regulamin Ligi
            </h3>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed group-hover:text-red-100">
              Zapoznaj się z zasadami rozgrywek, systemem punktowym i karami.
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            target="_blank"
            className="inline-block mt-8 text-xs font-black uppercase tracking-widest border-2 border-gray-900 px-6 py-3 self-start group-hover:border-white group-hover:text-white hover:bg-white hover:!text-red-600"
          >
            Czytaj Online
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomeView2;
