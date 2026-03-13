const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
      <div className="container mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <p className="font-bold text-white uppercase tracking-wider text-sm mb-1">
            ZSEM - Szkolna Liga Piłki Nożnej
          </p>
          <p className="text-xs">
            Zespół Szkół Elektryczno-Mechanicznych w Nowym Sączu
          </p>
        </div>
        
        <div className="flex space-x-6">
          <a 
            href="/rules.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm hover:text-white transition-colors flex items-center gap-2"
          >
            <span>📄 Regulamin</span>
          </a>
          <a 
            href="https://zsem.edu.pl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm hover:text-white transition-colors"
          >
            zsem.edu.pl
          </a>
        </div>

        <div className="mt-6 md:mt-0 text-xs opacity-50">
          &copy; 2026 Liga Sportowa ZSEM. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
