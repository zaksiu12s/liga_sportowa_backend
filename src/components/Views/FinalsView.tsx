const FinalsView = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 overflow-x-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">
          Drabinka <span className="text-red-600">Finałowa</span>
        </h1>
        <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Bracket Logic (CSS-based visualization) */}
      <div className="flex justify-between items-center gap-8 min-w-[800px] px-8">
        
        {/* Semi Finals */}
        <div className="space-y-24 w-64">
          <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4 text-center">Półfinały</div>
          
          {/* Match 1 */}
          <div className="relative">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-2 relative z-10">
              <div className="flex justify-between font-bold text-sm">
                <span>Drużyna 1A</span>
                <span className="text-red-600">-</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span>Drużyna 2B</span>
                <span className="text-red-600">-</span>
              </div>
            </div>
            {/* Connector */}
            <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-gray-200"></div>
          </div>

          {/* Match 2 */}
          <div className="relative">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-2 relative z-10">
              <div className="flex justify-between font-bold text-sm">
                <span>Drużyna 1B</span>
                <span className="text-red-600">-</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span>Drużyna 2A</span>
                <span className="text-red-600">-</span>
              </div>
            </div>
            {/* Connector */}
            <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-gray-200"></div>
          </div>
        </div>

        {/* Finals */}
        <div className="w-80">
          <div className="text-xs text-red-600 font-black uppercase tracking-widest mb-4 text-center">Wielki Finał</div>
          <div className="bg-gray-900 text-white border border-gray-800 shadow-2xl rounded-2xl p-8 space-y-4 scale-110 relative">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-lg whitespace-nowrap">
               Finał Ligi ZSEM 2026
             </div>
             
             <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Mecz o 1 Miejsce</div>
                  <div className="flex items-center gap-6 justify-center">
                    <span className="text-lg font-black italic">FINALISTA A</span>
                    <span className="text-3xl font-black text-red-600">VS</span>
                    <span className="text-lg font-black italic">FINALISTA B</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-800 px-4 py-2 rounded-lg mt-4 uppercase font-bold">
                  Data: 23.06.2026 | Godzina 11:00
                </div>
             </div>
          </div>

          {/* 3rd Place */}
          <div className="mt-32">
             <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4 text-center">Mecz o 3 Miejsce</div>
             <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="flex justify-between font-bold text-xs text-gray-500">
                  <span>Przegrany Półf. 1</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-gray-500 mt-2">
                  <span>Przegrany Półf. 2</span>
                  <span>-</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinalsView;
