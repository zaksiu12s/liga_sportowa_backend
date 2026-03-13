const Footer = () => {
  return (
    <footer className="border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
        <div>ZSEM Nowy Sącz 2026</div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="/rules.pdf" className="hover:text-gray-900">Regulamin</a>
          <a href="https://zsem.edu.pl" className="hover:text-gray-900">zsem.edu.pl</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
