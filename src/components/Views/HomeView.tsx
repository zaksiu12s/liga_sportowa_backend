const HomeView = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="flex justify-center mb-8">
          <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-900 shadow-xl overflow-hidden">
             {/* Replace with actual ZSEM logo path later */}
             <span className="text-4xl font-black text-gray-900">ZSEM</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight uppercase">
          Szkolna Liga <span className="text-red-600">Piłki Nożnej</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Oficjalna strona rozgrywek piłkarskich Zespołu Szkół Elektryczno-Mechanicznych w Nowym Sączu. 
          Rywalizacja, pasja i sportowy duch uczniów ZSEM oraz JCE.
        </p>
      </section>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-600 rounded-lg">🏆</span>
            O Turnieju
          </h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            W edycji 2026 bierze udział 15 drużyn podzielonych na 3 grupy. 
            Przed nami trzy etapy: faza grupowa, TOP 8 oraz wielki finał. 
            Mecze rozgrywane są na boisku Orlik JCE w Nowym Sączu.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="p-2 bg-gray-100 text-gray-900 rounded-lg">📜</span>
            Regulamin
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Zapoznaj się z pełnymi zasadami rozgrywek, systemem punktacji oraz zasadami gry "szóstkami".
          </p>
          <a 
            href="/rules.pdf" 
            target="_blank"
            className="inline-block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            Pobierz Regulamin (PDF)
          </a>
        </div>
      </div>

      {/* Stage Indicators */}
      <section className="bg-gray-900 text-white p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest text-red-500">
          Droga do Finału
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 border border-gray-800 rounded-xl bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1 uppercase">Etap 1</div>
            <div className="font-bold">Faza Grupowa</div>
            <div className="text-xs text-gray-400 mt-2">3 grupy po 5 drużyn</div>
          </div>
          <div className="p-4 border border-gray-800 rounded-xl bg-gray-800/50">
            <div className="text-xs text-gray-500 mb-1 uppercase">Etap 2</div>
            <div className="font-bold">TOP 8</div>
            <div className="text-xs text-gray-400 mt-2">2 grupy po 4 drużyny</div>
          </div>
          <div className="p-4 border border-red-900/50 rounded-xl bg-red-900/20">
            <div className="text-xs text-red-500/50 mb-1 uppercase">Etap 3</div>
            <div className="font-bold text-red-500">Final Four</div>
            <div className="text-xs text-red-500/50 mt-2">Półfinały i Finał</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
