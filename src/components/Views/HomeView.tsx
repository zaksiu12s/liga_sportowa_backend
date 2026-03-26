import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { View } from "../../types/app";
import { usePublicData } from "../../hooks/usePublicData";
import PdfModal, { preloadPdfFiles } from "../Layout/PdfModal";
import { lockBodyScrollKeepScrollbar } from "../../utils/modalScrollLock";
import {
  getNewsletterPromptTimerStartedAt,
  hasNewsletterPromptBeenSeen,
  markNewsletterPromptSeen,
  setNewsletterPromptTimerStartedAt,
  subscribeToNewsletter,
} from "../../utils/newsletter";

interface HomeViewProps {
  onNavigate?: (view: View) => void;
}

interface DocumentItem {
  title: string;
  icon: string;
  href: string;
}

type NextMatchData = {
  home_team?: { name: string } | null;
  away_team?: { name: string } | null;
  scheduled_at: string | null;
  status?: string | null;
};

const NEWSLETTER_PROMPT_DELAY_MS = 2 * 60 * 1000;

type SubmitSource = "footer" | "modal";

type NewsletterFeedback = {
  type: "success" | "error" | "info";
  message: string;
};

const HomeView = ({ onNavigate }: HomeViewProps) => {
  const { data } = usePublicData();
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(
    null,
  );
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [footerEmail, setFooterEmail] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [isFooterSubmitting, setIsFooterSubmitting] = useState(false);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [footerFeedback, setFooterFeedback] = useState<NewsletterFeedback | null>(
    null,
  );
  const [modalFeedback, setModalFeedback] = useState<NewsletterFeedback | null>(
    null,
  );
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);

  const documents: DocumentItem[] = [
    {
      title: "Regulamin",
      icon: "description",
      href: `${import.meta.env.BASE_URL}rules.pdf`,
    },
    {
      title: "Formularz",
      icon: "edit_document",
      href: `${import.meta.env.BASE_URL}form.pdf`,
    },
    {
      title: "Zgoda",
      icon: "assignment_turned_in",
      href: `${import.meta.env.BASE_URL}consent.pdf`,
    },
  ];

  useEffect(() => {
    preloadPdfFiles([
      `${import.meta.env.BASE_URL}rules.pdf`,
      `${import.meta.env.BASE_URL}form.pdf`,
      `${import.meta.env.BASE_URL}consent.pdf`,
    ]);
  }, []);

  useEffect(() => {
    if (hasNewsletterPromptBeenSeen()) {
      return;
    }

    const openPromptModal = () => {
      markNewsletterPromptSeen();
      setIsNewsletterModalOpen(true);
    };

    const startedAt = getNewsletterPromptTimerStartedAt();
    let remainingDelay = NEWSLETTER_PROMPT_DELAY_MS;

    if (startedAt) {
      const elapsed = Date.now() - startedAt;
      remainingDelay = Math.max(0, NEWSLETTER_PROMPT_DELAY_MS - elapsed);
    } else {
      setNewsletterPromptTimerStartedAt(Date.now());
    }

    if (remainingDelay === 0) {
      openPromptModal();
      return;
    }

    const timeoutId = window.setTimeout(openPromptModal, remainingDelay);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isNewsletterModalOpen) {
      return;
    }

    const releaseScrollLock = lockBodyScrollKeepScrollbar();

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNewsletterModalOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
      releaseScrollLock();
    };
  }, [isNewsletterModalOpen]);

  const getMatchWeekday = (dateString: string | null | undefined) => {
    if (!dateString) return "TERMIN TBD";
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString("pl-PL", { weekday: "long" });
    return dayName.toUpperCase();
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    const dateNum = date.getDate();
    const monthName = date.toLocaleDateString("pl-PL", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateNum} ${monthName.toUpperCase()} ${year} | ${time}`;
  };

  const teamsCount = data?.teams.length || 0;
  const matchesCount = data?.matches.length || 0;
  const loading = !data;

  const nextMatch = (data?.matches || []).find(
    (match) => match.status === "scheduled",
  ) as NextMatchData | undefined;
  const hasPlannedMatch = Boolean(nextMatch?.status === "scheduled");

  const handleNewsletterSubmit = async (
    event: React.FormEvent,
    source: SubmitSource,
  ) => {
    event.preventDefault();

    const email = source === "footer" ? footerEmail : modalEmail;
    const setSubmitting = source === "footer" ? setIsFooterSubmitting : setIsModalSubmitting;
    const setFeedback = source === "footer" ? setFooterFeedback : setModalFeedback;

    if (!email.trim()) {
      setFeedback({ type: "error", message: "Podaj adres e-mail." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await subscribeToNewsletter(email);
      markNewsletterPromptSeen();

      if (result === "already-subscribed") {
        setFeedback({
          type: "info",
          message: "Ten adres e-mail jest juz zapisany do newslettera.",
        });
      } else {
        setFeedback({
          type: "success",
          message: "Dzieki! Zapis do newslettera zakonczony sukcesem.",
        });
      }

      if (source === "footer") {
        setFooterEmail("");
      } else {
        setModalEmail("");
        setIsNewsletterModalOpen(false);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nie udalo sie zapisac do newslettera. Sprobuj ponownie.";

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-black mb-16 bg-white overflow-hidden">
        <div className="md:col-span-7 p-4 sm:p-6 md:p-12 flex flex-col justify-center text-left">
          <span className="bg-red-600 text-white px-4 py-1 self-start font-bold text-sm tracking-widest mb-6">
            SEZON 2026
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-6 sm:mb-8 break-words mr-[-0.2em]">
            LIGA <span className="text-red-600 block sm:inline">ELEKTRYKA</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-bold border-l-8 border-black pl-4 sm:pl-6 max-w-2xl mb-8 sm:mb-10 uppercase">
            Oficjalne rozgrywki Zespołu Szkół Elektryczno-Mechanicznych w Nowym
            Sącz oraz Jezuickiego Centrum Edukacji w Nowym Sączu
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate?.("schedule")}
              className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest border-2 border-black hover:bg-white hover:text-black transition-none"
            >
              ZOBACZ MECZE
            </button>
          </div>
        </div>
        <div className="md:col-span-5 bg-black flex items-center justify-center p-0 overflow-hidden min-h-[260px] sm:min-h-[340px] md:min-h-[400px]">
          <img
            className="w-full h-full object-cover grayscale contrast-150"
            alt="Czarno-białe zdjęcie stadionu sportowego"
            src={`https://www.fototapety.com/media/catalog/product/cache/296967dd00486cb8867f6b6fbb192224/w/0/w03239-small.jpg`}
          />
        </div>
      </section>

      {/* Next Match Teaser */}
      {hasPlannedMatch && (
        <section className="relative border-4 border-black bg-white overflow-visible mb-16">
          <span className="absolute left-1/2 -top-5 -translate-x-1/2 bg-black text-white px-6 sm:px-8 py-2 font-black uppercase tracking-widest text-sm sm:text-base text-center whitespace-nowrap">
            NAJBLIŻSZE SPOTKANIE
          </span>
          <div className="text-black p-4 md:p-8 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
              <div className="text-center md:text-right">
                <span className="block text-xs md:text-sm font-bold uppercase text-red-600">
                  GOSPODARZE
                </span>
                <span className="text-2xl md:text-3xl font-black uppercase">
                  {nextMatch?.home_team?.name || "NIEZNANA"}
                </span>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 bg-black text-white flex items-center justify-center font-black text-3xl md:text-4xl flex-shrink-0">
                VS
              </div>
              <div className="text-center md:text-left">
                <span className="block text-xs md:text-sm font-bold uppercase text-red-600">
                  GOŚCIE
                </span>
                <span className="text-2xl md:text-3xl font-black uppercase">
                  {nextMatch?.away_team?.name || "NIEZNANA"}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right w-full md:w-auto">
              <span className="block text-xs md:text-sm font-bold uppercase tracking-widest text-red-600">
                {getMatchWeekday(nextMatch?.scheduled_at)}
              </span>
              <span className="text-lg md:text-4xl font-black uppercase">
                {formatDateTime(nextMatch?.scheduled_at)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Bento Grid Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* About Us Card */}
        <div className="md:col-span-2 border-2 border-black bg-white p-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <span className="w-12 h-12 bg-black text-white flex items-center justify-center material-symbols-outlined">
              info
            </span>
            O LIDZE
          </h2>
          <div className="font-body text-lg leading-relaxed">
            <p>
              Liga Elektryka to nie tylko turniej – to manifestacja sportowego
              ducha i rywalizacji na najwyższym poziomie technikum i liceum. Od
              lat łączymy pasję do sportu z profesjonalną organizacją.
            </p>

            <div
              className={`overflow-hidden transition-all duration-300 md:overflow-visible ${
                isAboutExpanded
                  ? "max-h-[760px] opacity-100 mt-4"
                  : "max-h-0 opacity-0 md:max-h-[760px] md:opacity-100"
              }`}
            >
              <div className="space-y-4">
                <p>
                  Naszym celem jest promowanie aktywności fizycznej oraz
                  integracja społeczności uczniowskiej poprzez zdrowe
                  współzawodnictwo. W tym roku wprowadzamy nową formułę
                  rozgrywek i jeszcze wyższe standardy sędziowania.
                </p>
                <p>
                  W tym sezonie czeka nas wiele emocji, a każda drużyna będzie
                  walczyć o każdy punkt. Razem tworzymy historię Ligi Elektryka
                  – dołącz do nas i bądź częścią tej niesamowitej przygody!
                </p>
                <p className="border-t-4 border-red-600 pt-4 mt-4">
                  <span className="font-black text-red-600">
                    WSPÓŁPRACA Z JCE
                  </span>{" "}
                  –{" "}
                  <a
                    href="https://www.jce.pl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline hover:underline"
                  >
                    Jezuickie Centrum Edukacji
                  </a>
                  . Wspólnie tworzymy przestrzeń dla zdolnych sportowców i
                  entuzjastów, gdzie sport łączy się z edukacją na najwyższym
                  poziomie.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAboutExpanded((prev) => !prev)}
              className="mt-4 md:hidden border-2 border-black bg-white px-4 py-2 font-black uppercase tracking-widest text-xs"
            >
              {isAboutExpanded ? "POKAŻ MNIEJ" : "POKAŻ WIĘCEJ"}
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="border-2 border-black bg-red-600 text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">
              W LICZBACH
            </h2>
            <div className="space-y-6">
              <div>
                <span className="text-6xl font-black block leading-none">
                  {loading ? "..." : teamsCount}
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">
                  DRUŻYN
                </span>
              </div>
              <div className="border-t-2 border-white/30 pt-5">
                <span className="text-6xl font-black block leading-none">
                  {loading ? "..." : matchesCount}
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">
                  MECZÓW
                </span>
              </div>
              <div className="border-t-2 border-white/30 pt-5">
                <span className="text-6xl font-black block leading-none">
                  1
                </span>
                <span className="text-sm font-bold tracking-widest uppercase">
                  MISTRZ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <section className="mb-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 text-center md:text-left">
          DOKUMENTY I PLIKI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((document) => (
            <button
              key={document.title}
              type="button"
              onClick={() => setActiveDocument(document)}
              className="group border-2 border-black bg-white p-4 flex items-center justify-between gap-3 hover:bg-black transition-none"
            >
              <div className="flex-1 flex items-center gap-4 text-left">
                <span className="material-symbols-outlined text-4xl group-hover:text-white">
                  {document.icon}
                </span>
                <span className="font-black uppercase tracking-tight group-hover:text-white">
                  {document.title}
                </span>
                <span className="material-symbols-outlined ml-auto group-hover:text-white">
                  open_in_new
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-16 mb-4">
        <div className="bg-white border-4 border-black shadow-[10px_10px_0px_#dc2626] p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-3 py-1 font-black uppercase tracking-widest text-xs">
                <span className="material-symbols-outlined text-base">mail</span>
                NEWSLETTER
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.95]">
                Nie Przegap Kolejnych
                <span className="text-red-600 block">Informacji O Lidze</span>
              </h2>
              <p className="mt-3 text-sm sm:text-base font-semibold text-gray-700">
                Mecze, wyniki, ciekawostki i najwazniejsze ogloszenia prosto na
                Twoja skrzynke. Zero spamu, tylko konkret.
              </p>
            </div>

            <form
              onSubmit={(event) => void handleNewsletterSubmit(event, "footer")}
              className="w-full md:max-w-xl"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(event) => setFooterEmail(event.target.value)}
                  placeholder="twoj@email.pl"
                  autoComplete="email"
                  className="w-full border-2 border-black px-4 py-3 font-bold text-sm"
                />
                <button
                  type="submit"
                  disabled={isFooterSubmitting}
                  className="px-6 py-3 border-2 border-black bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFooterSubmitting ? "WYSYLANIE..." : "ZAPISZ MNIE"}
                </button>
              </div>

              {footerFeedback && (
                <p
                  className={`mt-3 text-xs sm:text-sm font-bold uppercase tracking-wide ${
                    footerFeedback.type === "success"
                      ? "text-green-700"
                      : footerFeedback.type === "info"
                        ? "text-blue-700"
                        : "text-red-700"
                  }`}
                >
                  {footerFeedback.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      <PdfModal
        isOpen={Boolean(activeDocument)}
        title={activeDocument?.title ?? "Podglad dokumentu"}
        fileUrl={activeDocument?.href ?? ""}
        onClose={() => setActiveDocument(null)}
      />

      {isNewsletterModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[10px_10px_0px_#dc2626]">
              <div className="flex items-center justify-between border-b-4 border-black px-4 py-3">
                <h2 className="font-black uppercase tracking-widest text-sm sm:text-base">
                  Dolacz Do Newslettera
                </h2>
                <button
                  type="button"
                  onClick={() => setIsNewsletterModalOpen(false)}
                  className="border-2 border-black px-3 py-1 font-black text-xs uppercase hover:bg-black hover:text-white"
                >
                  Zamknij
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-base sm:text-lg font-bold leading-relaxed">
                  Zostaw e-mail i otrzymuj informacje o terminarzu, wynikach i
                  waznych ogloszeniach ligi.
                </p>

                <form
                  onSubmit={(event) => void handleNewsletterSubmit(event, "modal")}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    value={modalEmail}
                    onChange={(event) => setModalEmail(event.target.value)}
                    placeholder="Wpisz swoj e-mail"
                    autoComplete="email"
                    className="w-full border-2 border-black px-4 py-3 font-bold text-sm"
                  />

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewsletterModalOpen(false)}
                      className="px-5 py-2 border-2 border-black bg-white font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white"
                    >
                      Nie teraz
                    </button>
                    <button
                      type="submit"
                      disabled={isModalSubmitting}
                      className="px-5 py-2 border-2 border-black bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isModalSubmitting ? "WYSYLANIE..." : "Zapisz"}
                    </button>
                  </div>
                </form>

                {modalFeedback && (
                  <p
                    className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${
                      modalFeedback.type === "success"
                        ? "text-green-700"
                        : modalFeedback.type === "info"
                          ? "text-blue-700"
                          : "text-red-700"
                    }`}
                  >
                    {modalFeedback.message}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
};

export default HomeView;
