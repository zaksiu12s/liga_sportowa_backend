const Footer = () => {
  return (
    <footer className="bg-black border-t-4 border-red-600 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-12 gap-6">
        <div className="text-lg font-black text-white uppercase">LIGA ELEKTRYKA</div>
        <div className="flex flex-wrap justify-center gap-8">
          <a
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            REGULAMIN
          </a>
          <a
            href={`${import.meta.env.BASE_URL}consent.pdf`}
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            ZGODA
          </a>
          <a
            href={`${import.meta.env.BASE_URL}form.pdf`}
            className="font-black uppercase text-xs tracking-widest text-gray-400 hover:text-red-500 transition-none"
          >
            FORMULARZ
          </a>
        </div>
        <div className="font-black uppercase text-[10px] tracking-widest text-gray-500 text-center md:text-right">
          © 2026 LIGA ELEKTRYKA. WSZYSTKIE PRAWA ZASTRZEŻONE.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
