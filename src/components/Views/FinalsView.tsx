const FinalsView = () => {
  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col py-2 px-4 dark:text-white">
      {/* Header */}
      <div className="flex flex-col items-center gap-6 flex-shrink-0 mb-12">
        <h1 className="text-2xl font-black uppercase tracking-widest border-b-4 border-gray-900 pb-2 dark:border-white">
          FINAŁY
        </h1>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {/* Półfinały */}
          <div className="space-y-12">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-8 dark:border-neutral-800 dark:text-gray-400">
              Półfinały
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="py-6 border border-gray-100 hover:border-gray-900 transition-colors dark:border-neutral-800 dark:hover:border-white"
              >
                <div className="text-xs font-black uppercase">TEAM {i}A</div>
                <div className="text-gray-400 my-2 text-[10px] font-bold">
                  VS
                </div>
                <div className="text-xs font-black uppercase">TEAM {i}B</div>
              </div>
            ))}
          </div>

          {/* Wielki Finał */}
          <div className="bg-gray-900 text-white p-12 flex flex-col justify-center border-4 border-gray-900 dark:bg-neutral-950 dark:border-white">
            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-6">
              Finał Główny
            </div>
            <div className="text-lg font-black italic tracking-tighter mb-2 uppercase">
              Finalista 1
            </div>
            <div className="text-red-600 font-black text-xl my-4">VS</div>
            <div className="text-lg font-black italic tracking-tighter uppercase">
              Finalista 2
            </div>
            <div className="text-[10px] text-gray-500 mt-8 font-bold uppercase tracking-widest">
              23.06.2026
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col justify-end">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-8 dark:border-neutral-800">
              Mecz o 3 Miejsce
            </div>
            <div className="py-6 border border-gray-100 grayscale opacity-40 dark:border-neutral-800">
              <div className="text-[10px] font-black uppercase">
                Przegrany P1
              </div>
              <div className="text-gray-400 my-1 text-[8px] font-bold">VS</div>
              <div className="text-[10px] font-black uppercase">
                Przegrany P2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalsView;
