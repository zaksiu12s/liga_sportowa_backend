const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-12 mt-auto dark:border-neutral-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-widest text-gray-400 uppercase">
        <div>ZSEM Nowy Sącz 2026</div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a
            href={`${import.meta.env.BASE_URL}rules.pdf`}
            className="hover:text-gray-900 dark:hover:text-white"
          >
            Regulamin
          </a>
          <a href="https://zsem.edu.pl" className="hover:text-gray-900 dark:hover:text-white">
            zsem.edu.pl
          </a>
          <a href="https://jce.pl/" className="hover:text-gray-900 dark:hover:text-white">
            jce.pl
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
