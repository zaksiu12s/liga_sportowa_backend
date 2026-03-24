import { useEffect, useState } from "react";

const creators = [
  {
    name: "Maksymilian Zajac",
    handle: "@zaksiu12s",
    avatar: "https://avatars.githubusercontent.com/u/129377563",
    profile: "https://github.com/zaksiu12s",
  },
  {
    name: "Filip Bodziony",
    handle: "@FilipBodziony",
    avatar: "https://avatars.githubusercontent.com/u/121246008",
    profile: "https://github.com/FilipBodziony",
  },
];

const Footer = () => {
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  useEffect(() => {
    if (!isGithubModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsGithubModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isGithubModalOpen]);

  return (
    <footer className="bg-black border-t-4 border-red-600 mt-20 relative">
      <div className="w-full px-3 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 text-center">
          <a
            href={import.meta.env.BASE_URL}
            className="text-lg font-black text-white uppercase hover:text-red-500 transition-none md:justify-self-start"
          >
            LIGA ELEKTRYKA
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 max-w-xl mx-auto md:justify-self-center">
          <a
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            REGULAMIN
          </a>
          <a
            href="https://zsem.edu.pl/"
            target="_blank"
            rel="noreferrer"
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            ZSEM
          </a>
          <a
            href="https://jce.pl/"
            target="_blank"
            rel="noreferrer"
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            JCE
          </a>
          <button
            type="button"
            onClick={() => setIsGithubModalOpen(true)}
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            GITHUB
          </button>
          </div>
          <div className="font-black uppercase text-[10px] tracking-widest text-gray-500 md:justify-self-end md:text-right">
            © 2026 LIGA ELEKTRYKA.
          </div>
        </div>
      </div>

      {isGithubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsGithubModalOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setIsGithubModalOpen(false);
            }
          }}
          role="button"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_#dc2626]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-4 border-black px-6 py-4">
              <h3 className="font-black uppercase text-lg tracking-wide">Twórcy strony</h3>
              <button
                type="button"
                onClick={() => setIsGithubModalOpen(false)}
                className="font-black uppercase text-xs tracking-widest text-gray-700 hover:text-red-600"
              >
                Zamknij
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              {creators.map((creator) => (
                <a
                  key={creator.handle}
                  href={creator.profile}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 border-2 border-black p-3 hover:bg-gray-100"
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="h-14 w-14 rounded-full border-2 border-black object-cover"
                  />
                  <div className="text-left">
                    <p className="font-black uppercase text-sm text-black">{creator.name}</p>
                    <p className="font-bold text-sm text-gray-700">{creator.handle}</p>
                  </div>
                </a>
              ))}

              <div className="border-t-2 border-black pt-4">
                <a
                  href="https://github.com/zaksiu12s/liga_sportowa_backend"
                  target="_blank"
                  rel="noreferrer"
                  className="font-black uppercase text-xs tracking-widest text-red-700 hover:text-red-500"
                >
                  Zobacz kod zrodlowy
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
