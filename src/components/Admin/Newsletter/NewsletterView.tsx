import { useEffect, useMemo, useRef, useState } from "react";
import type { MailQueueItem, Subscriber } from "../../../types/admin";
import { newsletterApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const toLocalDatetimeInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isEditableQueueItem = (item: MailQueueItem): boolean =>
  item.status !== "sent" && !item.sent_at;

type AiProvider = "groq" | "gemini";
type AiRequestType = "report" | "promo" | "recap" | "announcement";
// Rewrite AI disabled:
// type RewriteStyle = "normalnie" | "smiesznie" | "formalnie" | "krotko";
type LogoChoice = "logo1" | "logo2" | "custom";

interface AiGenerator {
  id: AiRequestType;
  label: string;
  description: string;
}

// Rewrite AI disabled:
// interface RewriteOption {
//   id: RewriteStyle;
//   label: string;
//   description: string;
// }

const buildGenerators = (): AiGenerator[] => [
  {
    id: "report",
    label: "Sprawozdanie Ligi",
    description: "AI generuje sprawozdanie z ostatnich wyników ligi",
  },
  {
    id: "promo",
    label: "Zapowiedz / CTA",
    description:
      "AI tworzy neutralna zapowiedz wydarzen z wezwaniem do dzialania",
  },
  {
    id: "recap",
    label: "Podsumowanie tygodnia",
    description: "Krótkie AI podsumowanie mijającego tygodnia w lidze",
  },
  {
    id: "announcement",
    label: "Ogłoszenie",
    description: "AI szkicuje ogłoszenie o nadchodzącym wydarzeniu",
  },
];

// Rewrite AI disabled:
// const rewriteOptions: RewriteOption[] = [
//   {
//     id: "normalnie",
//     label: "Rewrite: Normalnie",
//     description: "Przepisuje newsletter w neutralnym, czytelnym stylu",
//   },
//   {
//     id: "smiesznie",
//     label: "Rewrite: Smiesznie",
//     description: "Nadaje tresci lekki i bardziej rozrywkowy ton",
//   },
//   {
//     id: "formalnie",
//     label: "Rewrite: Formalnie",
//     description: "Przerabia tekst na oficjalny i profesjonalny jezyk",
//   },
//   {
//     id: "krotko",
//     label: "Rewrite: Krotko",
//     description: "Skraca i porzadkuje tresc do najwazniejszych punktow",
//   },
// ];

// ─── HTML Editor with Preview ─────────────────────────────────────────────────

type EditorTab = "code" | "preview" | "split";

interface HtmlEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  heightClassName?: string;
}

const HtmlEditor = ({
  value,
  onChange,
  disabled,
  heightClassName = "h-[70vh] min-h-[34rem]",
}: HtmlEditorProps) => {
  const [tab, setTab] = useState<EditorTab>("split");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Refresh iframe content whenever HTML or tab changes
  useEffect(() => {
    if (tab === "code") return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(value);
    doc.close();
  }, [value, tab]);

  const tabs: { id: EditorTab; label: string }[] = [
    { id: "code", label: "⌨ Kod" },
    { id: "split", label: "⬛ Split" },
    { id: "preview", label: "👁 Podgląd" },
  ];

  return (
    <div className="border-2 border-black">
      {/* Tab bar */}
      <div className="flex border-b-2 border-black bg-gray-100">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-r-2 border-black transition-colors ${
              tab === t.id
                ? "bg-black text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panes */}
      <div
        className={`${tab === "split" ? "grid grid-cols-2" : "flex"} ${heightClassName}`}
      >
        {/* Code pane */}
        {(tab === "code" || tab === "split") && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            spellCheck={false}
            className={`h-full p-3 text-sm font-mono resize-none focus:outline-none bg-[#1a1a1a] text-green-400 disabled:opacity-60 ${
              tab === "split" ? "border-r-2 border-black" : "w-full"
            }`}
          />
        )}

        {/* Preview pane */}
        {(tab === "preview" || tab === "split") && (
          <div
            className={`h-full overflow-auto bg-white ${tab === "preview" ? "w-full" : ""}`}
          >
            <iframe
              ref={iframeRef}
              title="HTML Preview"
              sandbox="allow-same-origin"
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface AiDropdownProps {
  generators: AiGenerator[];
  onGenerate: (gen: AiGenerator) => void;
  isGenerating: boolean;
  currentId: AiRequestType | null;
  disabled?: boolean;
}

// Rewrite AI disabled:
// interface RewriteDropdownProps {
//   options: RewriteOption[];
//   onRewrite: (option: RewriteOption) => void;
//   isGenerating: boolean;
//   currentStyle: RewriteStyle;
//   disabled?: boolean;
// }

interface LogoDropdownProps {
  selected: LogoChoice;
  onSelect: (choice: LogoChoice) => void;
  disabled?: boolean;
}

const logoChoiceLabel = (choice: LogoChoice): string => {
  if (choice === "logo1") return "LOGO 1";
  if (choice === "logo2") return "LOGO 2";
  return "TWOJE LOGO";
};

const LogoDropdown = ({ selected, onSelect, disabled }: LogoDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options: LogoChoice[] = ["logo1", "logo2", "custom"];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60"
      >
        ✦ {logoChoiceLabel(selected)} ▾
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[220px]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(option);
              }}
              className={`w-full text-left px-4 py-3 border-b-2 border-black last:border-b-0 hover:bg-black hover:text-white transition-colors ${
                selected === option ? "bg-gray-100" : "bg-white"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-widest">
                {logoChoiceLabel(option)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AiDropdown = ({
  generators,
  onGenerate,
  isGenerating,
  currentId,
  disabled,
}: AiDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isGenerating || disabled}
        className="flex items-center gap-2 px-3 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <span className="inline-block w-3 h-3 border border-white border-r-transparent animate-spin" />
            Generowanie...
          </>
        ) : (
          <>✦ Generuj AI ▾</>
        )}
      </button>

      {open && !isGenerating && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[280px]">
          {generators.map((gen) => (
            <button
              key={gen.id}
              type="button"
              onClick={() => {
                setOpen(false);
                onGenerate(gen);
              }}
              className={`w-full text-left px-4 py-3 border-b-2 border-black last:border-b-0 hover:bg-black hover:text-white transition-colors ${
                currentId === gen.id ? "bg-gray-100" : "bg-white"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-widest">
                {gen.label}
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {gen.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Rewrite AI disabled:
// const RewriteDropdown = ({
//   options,
//   onRewrite,
//   isGenerating,
//   currentStyle,
//   disabled,
// }: RewriteDropdownProps) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);
//
//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);
//
//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         disabled={isGenerating || disabled}
//         className="flex items-center gap-2 px-3 py-2 bg-white text-black border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
//       >
//         ↻ Rewrite AI ▾
//       </button>
//
//       {open && !isGenerating && (
//         <div className="absolute right-0 top-full mt-1 z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[300px]">
//           {options.map((option) => (
//             <button
//               key={option.id}
//               type="button"
//               onClick={() => {
//                 setOpen(false);
//                 onRewrite(option);
//               }}
//               className={`w-full text-left px-4 py-3 border-b-2 border-black last:border-b-0 hover:bg-black hover:text-white transition-colors ${
//                 currentStyle === option.id ? "bg-gray-100" : "bg-white"
//               }`}
//             >
//               <p className="text-xs font-black uppercase tracking-widest">
//                 {option.label}
//               </p>
//               <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                 {option.description}
//               </p>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// ─── Main Component ───────────────────────────────────────────────────────────

export const NewsletterView = () => {
  const { showToast } = useToast();
  const logo1Url = "https://www.ligaelektryka.pl/football_league_logo.jpg";
  const logo2Url = "https://www.ligaelektryka.pl/le_logo.svg";

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [queueItems, setQueueItems] = useState<MailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingProvider, setGeneratingProvider] =
    useState<AiProvider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("groq");
  const [selectedRequestType, setSelectedRequestType] =
    useState<AiRequestType>("report");
  const generators = useMemo(() => buildGenerators(), []);

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState(
    "<h1>Cześć!</h1>\n<p>Treść newslettera...</p>",
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editHtml, setEditHtml] = useState("");
  const [editScheduledAtLocal, setEditScheduledAtLocal] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingQueueId, setDeletingQueueId] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{
    providerRequested: AiProvider;
    providerUsed: string;
    requestTypeRequested: AiRequestType;
    requestTypeUsed: AiRequestType;
    fallbackUsed: boolean;
    generatedAt: string | null;
  } | null>(null);
  const [selectedLogoChoice, setSelectedLogoChoice] =
    useState<LogoChoice>("logo1");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  // Rewrite AI disabled:
  // const [selectedRewriteStyle, setSelectedRewriteStyle] =
  //   useState<RewriteStyle>("normalnie");
  const [isAiLogoAwarenessEnabled, setIsAiLogoAwarenessEnabled] =
    useState(false);

  const pendingCount = useMemo(
    () => queueItems.filter((item) => item.status === "pending").length,
    [queueItems],
  );

  const getSelectedLogoSrc = (): string | null => {
    if (selectedLogoChoice === "logo1") return logo1Url;
    if (selectedLogoChoice === "logo2") return logo2Url;

    const custom = customLogoUrl.trim();
    if (!custom) return null;
    if (!/^https?:\/\//i.test(custom)) return null;
    return custom;
  };

  const handleInsertSiteLogo = () => {
    const activeLogoSrc = getSelectedLogoSrc();
    if (!activeLogoSrc) {
      showToast("Dla opcji TWOJE LOGO podaj poprawny URL", "error");
      return;
    }

    const logoBlock = [
      `<div style="text-align:center;margin:0 0 20px 0;">`,
      `<img src="${activeLogoSrc}" alt="Liga Elektryka" style="max-width:180px;width:100%;height:auto;display:inline-block;" />`,
      `</div>`,
    ].join("");

    setHtml((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${logoBlock}\n${trimmed}` : logoBlock;
    });

    showToast("Dodano wybrane logo do treści newslettera", "success");
  };

  const handleGenerateBySelection = async (requestedType?: AiRequestType) => {
    const provider = selectedProvider;
    const requestType = requestedType ?? selectedRequestType;
    const requestOption = generators.find(
      (option) => option.id === requestType,
    );

    if (!requestOption) {
      showToast("Nieznany typ requestu AI", "error");
      return;
    }

    setGeneratingProvider(provider);
    setSelectedRequestType(requestType);
    try {
      const result = await newsletterApi.generateNewsletterContent({
        provider,
        requestType,
        logoAwareness: isAiLogoAwarenessEnabled,
        logoUrl: isAiLogoAwarenessEnabled
          ? getSelectedLogoSrc() || undefined
          : undefined,
      });

      setSubject(result.subject);
      setHtml(result.html);
      setAiFeedback({
        providerRequested: provider,
        providerUsed: result.providerUsed,
        requestTypeRequested: requestType,
        requestTypeUsed: result.requestTypeUsed,
        fallbackUsed: result.fallbackUsed,
        generatedAt: result.generatedAt,
      });

      if (result.fallbackUsed) {
        showToast(
          `Wygenerowano ${requestOption.label}. Wybrany ${provider.toUpperCase()} nie odpowiedział, użyto ${result.providerUsed.toUpperCase()}.`,
          "info",
        );
      } else {
        showToast(
          `Wygenerowano ${requestOption.label} przez ${result.providerUsed.toUpperCase()}.`,
          "success",
        );
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Błąd generowania",
        "error",
      );
    } finally {
      setGeneratingProvider(null);
    }
  };

  // Rewrite AI disabled:
  // const handleRewriteByStyle = async (style?: RewriteStyle) => {
  //   const provider = selectedProvider;
  //   const rewriteStyle = style ?? selectedRewriteStyle;
  //   const rewriteOption = rewriteOptions.find(
  //     (option) => option.id === rewriteStyle,
  //   );
  //
  //   if (!rewriteOption) {
  //     showToast("Nieznany styl przepisywania", "error");
  //     return;
  //   }
  //
  //   if (!html.trim()) {
  //     showToast("Dodaj HTML zanim uzyjesz Rewrite", "error");
  //     return;
  //   }
  //
  //   setGeneratingProvider(provider);
  //   setSelectedRewriteStyle(rewriteStyle);
  //   try {
  //     const result = await newsletterApi.generateNewsletterContent({
  //       provider,
  //       requestType: selectedRequestType,
  //       mode: "rewrite",
  //       rewriteStyle,
  //       sourceHtml: html,
  //       sourceSubject: subject,
  //       logoAwareness: isAiLogoAwarenessEnabled,
  //       logoUrl: isAiLogoAwarenessEnabled
  //         ? getSelectedLogoSrc() || undefined
  //         : undefined,
  //     });
  //
  //     setSubject(result.subject);
  //     setHtml(result.html);
  //     setAiFeedback({
  //       providerRequested: provider,
  //       providerUsed: result.providerUsed,
  //       requestTypeRequested: selectedRequestType,
  //       requestTypeUsed: result.requestTypeUsed,
  //       fallbackUsed: result.fallbackUsed,
  //       generatedAt: result.generatedAt,
  //     });
  //
  //     if (result.fallbackUsed) {
  //       showToast(
  //         `Przepisano tresc (${rewriteOption.label}). Uzyto ${result.providerUsed.toUpperCase()} po fallbacku.`,
  //         "info",
  //       );
  //     } else {
  //       showToast(`Przepisano tresc: ${rewriteOption.label}.`, "success");
  //     }
  //   } catch (err) {
  //     showToast(
  //       err instanceof Error ? err.message : "Blad przepisywania",
  //       "error",
  //     );
  //   } finally {
  //     setGeneratingProvider(null);
  //   }
  // };

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscribersData, queueData] = await Promise.all([
        newsletterApi.getSubscribers(),
        newsletterApi.getQueue(80),
      ]);
      setSubscribers(subscribersData);
      setQueueItems(queueData);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to load newsletter data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const startQueueEdit = (item: MailQueueItem) => {
    if (!isEditableQueueItem(item)) {
      showToast("Wysłanych emaili nie można edytować.", "error");
      return;
    }

    setEditingQueueId(item.id);
    setEditSubject(item.subject);
    setEditHtml(item.html);
    setEditScheduledAtLocal(toLocalDatetimeInput(item.scheduled_at));
  };

  const resetEditState = () => {
    setEditingQueueId(null);
    setEditSubject("");
    setEditHtml("");
    setEditScheduledAtLocal("");
  };

  const handleSaveQueueEdit = async () => {
    if (!editingQueueId) return;

    if (!editSubject.trim()) {
      showToast("Subject is required", "error");
      return;
    }

    if (!editHtml.trim()) {
      showToast("HTML content is required", "error");
      return;
    }

    if (!editScheduledAtLocal) {
      showToast("Scheduled date is required", "error");
      return;
    }

    const parsedDate = new Date(editScheduledAtLocal);
    if (Number.isNaN(parsedDate.getTime())) {
      showToast("Invalid scheduled date", "error");
      return;
    }

    setIsSavingEdit(true);
    try {
      await newsletterApi.updateScheduledQueueItem({
        id: editingQueueId,
        subject: editSubject,
        html: editHtml,
        scheduledAt: parsedDate.toISOString(),
      });

      showToast("Scheduled email updated", "success");
      resetEditState();
      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to update scheduled email",
        "error",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteQueueItem = async (item: MailQueueItem) => {
    if (!isEditableQueueItem(item)) {
      showToast("Wysłanych emaili nie można usunąć.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Usunąć zaplanowany email dla ${item.email}?`,
    );
    if (!confirmed) return;

    setDeletingQueueId(item.id);
    try {
      await newsletterApi.deleteScheduledQueueItem(item.id);
      if (editingQueueId === item.id) {
        resetEditState();
      }
      showToast("Scheduled email removed", "success");
      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete scheduled email",
        "error",
      );
    } finally {
      setDeletingQueueId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim()) {
      showToast("Subject is required", "error");
      return;
    }
    if (!html.trim()) {
      showToast("HTML content is required", "error");
      return;
    }

    let scheduledAtIso: string | undefined;
    if (isScheduled) {
      if (!scheduledAtLocal) {
        showToast("Select a scheduled date and time", "error");
        return;
      }
      const parsedDate = new Date(scheduledAtLocal);
      if (Number.isNaN(parsedDate.getTime())) {
        showToast("Invalid scheduled date", "error");
        return;
      }
      scheduledAtIso = parsedDate.toISOString();
    }

    setIsSubmitting(true);
    try {
      const insertedCount = await newsletterApi.enqueueToAllSubscribers({
        subject,
        html,
        scheduledAt: scheduledAtIso,
      });

      showToast(
        `Queued ${insertedCount} emails${isScheduled ? " (scheduled)" : ""}`,
        "success",
      );

      setSubject("");
      setHtml("<h1>Cześć!</h1>\n<p>Treść newslettera...</p>");
      setIsScheduled(false);
      setScheduledAtLocal("");
      setAiFeedback(null);

      await loadData();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to enqueue newsletter",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-black border-r-transparent animate-spin mb-4" />
          <p className="font-black uppercase text-sm tracking-widest">
            Loading newsletter...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black p-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-600">
            Subscribers
          </p>
          <p className="text-3xl font-black mt-2">{subscribers.length}</p>
        </div>
        <div className="bg-white border-2 border-black p-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-600">
            Queue Rows (latest)
          </p>
          <p className="text-3xl font-black mt-2">{queueItems.length}</p>
        </div>
        <div className="bg-white border-2 border-black p-4">
          <p className="text-xs font-black uppercase tracking-widest text-gray-600">
            Pending
          </p>
          <p className="text-3xl font-black mt-2">{pendingCount}</p>
        </div>
      </div>

      {/* Compose form */}
      <div className="bg-white border-2 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black pb-3">
          Create Newsletter Queue
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* AI tools */}
          <div className="border-2 border-black p-4 space-y-3 bg-gray-50">
            <p className="text-xs font-black uppercase tracking-widest">
              AI Tools
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex border-2 border-black overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelectedProvider("groq")}
                  disabled={Boolean(generatingProvider) || isSubmitting}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-60 ${
                    selectedProvider === "groq"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  AI GROQ
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProvider("gemini")}
                  disabled={Boolean(generatingProvider) || isSubmitting}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-widest border-l-2 border-black transition-colors disabled:opacity-60 ${
                    selectedProvider === "gemini"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  AI GEMINI
                </button>
              </div>

              <AiDropdown
                generators={generators}
                onGenerate={(gen) => void handleGenerateBySelection(gen.id)}
                isGenerating={Boolean(generatingProvider)}
                currentId={selectedRequestType}
                disabled={isSubmitting}
              />

              {/* Rewrite AI disabled */}
              {/*
              <RewriteDropdown
                options={rewriteOptions}
                onRewrite={(option) => void handleRewriteByStyle(option.id)}
                isGenerating={Boolean(generatingProvider)}
                currentStyle={selectedRewriteStyle}
                disabled={isSubmitting}
              />
              */}
            </div>

            {selectedProvider === "gemini" && (
              <div className="border-2 border-yellow-700 bg-yellow-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-yellow-900">
                Warning: Gemini limit in this project is 20 requests per day.
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <LogoDropdown
                selected={selectedLogoChoice}
                onSelect={setSelectedLogoChoice}
                disabled={isSubmitting || Boolean(generatingProvider)}
              />

              {selectedLogoChoice === "custom" && (
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://twojastrona.pl/logo.png"
                  className="flex-1 border-2 border-black px-3 py-2 text-sm font-semibold"
                  disabled={isSubmitting || Boolean(generatingProvider)}
                />
              )}

              <button
                type="button"
                onClick={() => setIsAiLogoAwarenessEnabled((prev) => !prev)}
                disabled={isSubmitting || Boolean(generatingProvider)}
                className={`px-3 py-2 border-2 border-black font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-60 ${
                  isAiLogoAwarenessEnabled
                    ? "bg-black text-white"
                    : "bg-white text-black hover:bg-black hover:text-white"
                }`}
              >
                AI dopasuj logo
              </button>

              <button
                type="button"
                onClick={handleInsertSiteLogo}
                disabled={isSubmitting || Boolean(generatingProvider)}
                className="px-3 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60"
              >
                Wstaw logo
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject"
              className="w-full border-2 border-black px-3 py-2 text-sm font-semibold"
            />
          </div>

          {/* HTML Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-widest">
                HTML Content
              </label>
            </div>

            {aiFeedback && (
              <div className="mb-3 border-2 border-black bg-gray-50 px-3 py-2 text-xs text-gray-800 space-y-1">
                <p className="font-black uppercase tracking-widest">
                  AI Feedback
                </p>
                <p>
                  Requested: {aiFeedback.providerRequested.toUpperCase()} /{" "}
                  {aiFeedback.requestTypeRequested.toUpperCase()}
                </p>
                <p>
                  Used: {aiFeedback.providerUsed.toUpperCase()} /{" "}
                  {aiFeedback.requestTypeUsed.toUpperCase()}
                </p>
                <p>Fallback used: {aiFeedback.fallbackUsed ? "YES" : "NO"}</p>
                <p>
                  Generated at:{" "}
                  {aiFeedback.generatedAt
                    ? formatDateTime(aiFeedback.generatedAt)
                    : "-"}
                </p>
              </div>
            )}

            <HtmlEditor
              value={html}
              onChange={setHtml}
              disabled={isSubmitting || Boolean(generatingProvider)}
            />
          </div>

          {/* Schedule */}
          <div className="border-2 border-black p-4 bg-gray-50 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
              />
              Schedule send time
            </label>

            {isScheduled && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">
                  Scheduled At
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAtLocal}
                  onChange={(e) => setScheduledAtLocal(e.target.value)}
                  className="border-2 border-black px-3 py-2 text-sm font-semibold"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Worker sends only rows where scheduled_at is earlier or equal
                  to current time.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || subscribers.length === 0}
              className="px-6 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Queueing..." : "Create Queue"}
            </button>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white text-black border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </form>
      </div>

      {/* Subscribers table */}
      <div className="bg-white border-2 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black pb-3">
          Subscribers
        </h3>
        <div className="mt-4 max-h-60 overflow-auto border-2 border-black">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Email
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Signed At
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber, index) => (
                <tr
                  key={subscriber.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 font-semibold">
                    {subscriber.email}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {formatDateTime(subscriber.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscribers.length === 0 && (
            <div className="p-4 text-sm text-gray-600">
              No subscribers found.
            </div>
          )}
        </div>
      </div>

      {/* Queue table */}
      <div className="bg-white border-2 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black pb-3">
          Email Queue (latest 80)
        </h3>
        <div className="mt-4 max-h-80 overflow-auto border-2 border-black">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black">
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Email
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Subject
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Status
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Retries
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Scheduled
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Created
                </th>
                <th className="text-left px-3 py-2 font-black uppercase text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {queueItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-2 font-semibold">{item.email}</td>
                  <td className="px-3 py-2">{item.subject}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-1 border text-xs font-black uppercase ${
                        item.status === "sent"
                          ? "bg-green-100 border-green-600 text-green-900"
                          : item.status === "failed"
                            ? "bg-red-100 border-red-600 text-red-900"
                            : "bg-yellow-100 border-yellow-600 text-yellow-900"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{item.retries}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {formatDateTime(item.scheduled_at)}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startQueueEdit(item)}
                        disabled={
                          !isEditableQueueItem(item) ||
                          isSavingEdit ||
                          deletingQueueId === item.id
                        }
                        className="px-2 py-1 border border-black text-xs font-black uppercase tracking-widest bg-white hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteQueueItem(item)}
                        disabled={
                          !isEditableQueueItem(item) ||
                          deletingQueueId === item.id ||
                          isSavingEdit
                        }
                        className="px-2 py-1 border border-black text-xs font-black uppercase tracking-widest bg-white hover:bg-black hover:text-white disabled:opacity-50"
                      >
                        {deletingQueueId === item.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {queueItems.length === 0 && (
            <div className="p-4 text-sm text-gray-600">Queue is empty.</div>
          )}
        </div>

        {editingQueueId && (
          <div className="mt-4 border-2 border-black p-4 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest">
                Edit Scheduled Email
              </h4>
              <button
                type="button"
                onClick={resetEditState}
                disabled={isSavingEdit}
                className="px-3 py-1 border-2 border-black bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-60"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Subject
              </label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Scheduled At
              </label>
              <input
                type="datetime-local"
                value={editScheduledAtLocal}
                onChange={(e) => setEditScheduledAtLocal(e.target.value)}
                className="border-2 border-black px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                HTML
              </label>
              <HtmlEditor
                value={editHtml}
                onChange={setEditHtml}
                disabled={isSavingEdit}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleSaveQueueEdit()}
                disabled={isSavingEdit}
                className="px-4 py-2 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
