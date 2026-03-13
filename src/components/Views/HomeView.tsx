const HomeView = () => {
  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col justify-center space-y-12 overflow-hidden px-4">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter">
          LIGA <span className="text-red-600">ZSEM</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Szkolna Liga Piłki Nożnej 2026
        </p>
      </header>

      <section className="border-y border-gray-100 py-12 text-sm leading-relaxed text-gray-600 text-center">
        Oficjalne rozgrywki Zespołu Szkół Elektryczno-Mechanicznych w Nowym
        Sączu. Minimalistyczny interfejs dostarczający najnowsze wyniki i
        tabele.
      </section>

      <div className="flex flex-col items-center space-y-6">
        <a
          href={`${import.meta.env.BASE_URL}rules.pdf`}
          target="_blank"
          className="text-xs font-black uppercase tracking-[0.2em] px-12 py-4 border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
        >
          Regulamin PDF
        </a>
      </div>
    </div>
  );
};

export default HomeView;
