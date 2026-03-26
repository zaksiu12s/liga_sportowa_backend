// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";

const dedent = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  const raw = strings.reduce((acc, part, index) => {
    const value = index < values.length ? String(values[index]) : "";
    return acc + part + value;
  }, "");

  const lines = raw.replace(/^\n/, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(minIndent)).join("\n").trim();
};

const modelName = "gemini-3-flash-preview";
type RequestType = "report" | "promo" | "recap" | "announcement";
type GenerationMode = "generate" | "rewrite";
type RewriteStyle = "normalnie" | "smiesznie" | "formalnie" | "krotko";

const noCommercialPolicy = dedent`
  Zakaz tresci komercyjnych:
  - nie wspominaj o pieniadzach, cenach, cennikach, oplatach ani platnosciach,
  - nie wspominaj o znizkach, rabatach, kodach rabatowych ani kuponach,
  - nie uzywaj jezyka promocji/sprzedazy (np. promocja, oferta specjalna, kup, zamow).
`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const getEnv = (key: string): string => {
  const value = Deno.env.get(key);   
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const createAdminClient = () =>
  createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const requireAuthUser = async (req: Request): Promise<Response | null> => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "Unauthorized" });

  const supabaseClient = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_ANON_KEY"));
  const { data: { user }, error } = await supabaseClient.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (error || !user) return json(401, { error: "Unauthorized" });
  return null;
};

const fetchAllData = async (supabase: ReturnType<typeof createAdminClient>) => {
  const [teams, players, matches, topScorers, subscribers, firstStage, secondStage, finalStage] =
    await Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
      supabase.from("matches").select("*, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)"),
      supabase.from("top_scorers").select("*").order("goals", { ascending: false }),
      supabase.from("subscribers").select("id, created_at"),
      supabase.from("first_stage").select("*"),
      supabase.from("second_stage").select("*"),
      supabase.from("final_stage").select("*, home_team:teams!final_stage_home_team_id_fkey(name), away_team:teams!final_stage_away_team_id_fkey(name)"),
    ]);

  return {
    teams: teams.data ?? [],
    players: players.data ?? [],
    matches: matches.data ?? [],
    topScorers: topScorers.data ?? [],
    subscribersCount: (subscribers.data ?? []).length,
    firstStage: firstStage.data ?? [],
    secondStage: secondStage.data ?? [],
    finalStage: finalStage.data ?? [],
  };
};

const getRequestInstructions = (requestType: RequestType): string => {
  if (requestType === "promo") {
    return [
      "Typ requestu: ZAPOWIEDZ / ZAANGAZOWANIE",
      "Stworz newsletter, ktory wzmacnia zaangazowanie kibicow wokol ligi i najblizszych wydarzen.",
      "Sekcje: mocny naglowek, 3 powody sledzenia rozgrywek, neutralne CTA (przycisk/link placeholder), krotkie podsumowanie wynikow.",
      "Ton: energiczny, pozytywny, konkretny, bez jezyka sprzedazowego.",
    ].join("\n");
  }

  if (requestType === "recap") {
    return [
      "Typ requestu: PODSUMOWANIE TYGODNIA",
      "Stwórz krótkie podsumowanie ostatnich wydarzeń ligi.",
      "Sekcje: najważniejsze wyniki, top strzelcy tygodnia, co dalej w kalendarzu.",
      "Ton: rzeczowy i dynamiczny.",
    ].join("\n");
  }

  if (requestType === "announcement") {
    return [
      "Typ requestu: OGŁOSZENIE",
      "Stwórz formalno-informacyjne ogłoszenie dla uczestników ligi.",
      "Sekcje: nagłówek ogłoszenia, najważniejsze informacje organizacyjne, terminy i przypomnienia.",
      "Ton: jasny, oficjalny, zwięzły.",
    ].join("\n");
  }

  return [
    "Typ requestu: SPRAWOZDANIE LIGI",
    "Stwórz pełne sprawozdanie sezonowe oparte o dane.",
    "Sekcje: podsumowanie sezonu, tabela wyników meczów, top strzelcy, nadchodzące mecze, prognoza.",
  ].join("\n");
};

const getSubjectHint = (requestType: RequestType): string => {
  if (requestType === "promo") return "Temat zapowiedzi wydarzen z neutralnym CTA";
  if (requestType === "recap") return "Temat podsumowujący tydzień rozgrywek";
  if (requestType === "announcement") return "Temat ogłoszenia organizacyjnego";
  return "Temat sprawozdania ligowego";
};

const buildPrompt = (
  data: Awaited<ReturnType<typeof fetchAllData>>,
  requestType: RequestType,
  options?: { logoAwareness?: boolean; logoUrl?: string },
): string => {
  const completedMatches = data.matches.filter((m) => m.status === "completed");
  const scheduledMatches = data.matches.filter((m) => m.status === "scheduled");

  const matchesSummary = completedMatches
    .map((m) => `- ${m.home_team?.name} ${m.score_home}:${m.score_away} ${m.away_team?.name} (${m.stage ?? "brak etapu"}, grupa ${m.group ?? "-"})`)
    .join("\n");

  const scheduledSummary = scheduledMatches
    .map((m) => `- ${m.home_team?.name} vs ${m.away_team?.name} (${m.scheduled_at ? new Date(m.scheduled_at).toLocaleString("pl-PL") : "brak daty"})`)
    .join("\n");

  const topScorersSummary = data.topScorers
    .slice(0, 10)
    .map((s, i) => `${i + 1}. ${s.player_name} (${s.team_name}) - ${s.goals} goli`)
    .join("\n");

  const teamsSummary = data.teams.map((t) => {
    const teamPlayers = data.players.filter((p) => p.team_id === t.id);
    return `- ${t.name} (${teamPlayers.length} graczy)`;
  }).join("\n");

  const logoAwarenessText = options?.logoAwareness
    ? `
=== AWARENESS LOGO ===
- Uwzględnij branding ligi spójnie z logo.
- Wstaw logo na początku treści (sekcja hero) jako <img>.
- Użyj źródła logo: ${options?.logoUrl || "https://www.ligaelektryka.pl/le_logo.svg"}.
`
    : "";

  return `Jesteś copywriterem sportowym dla ligi piłkarskiej "Liga Elektryka" - szkolnej ligi piłki nożnej.
Na podstawie poniższych danych wygeneruj treść newslettera w języku polskim.

WAŻNE: Odpowiedz WYŁĄCZNIE kodem HTML gotowym do wklejenia w treść e-maila newslettera.
- Nie dodawaj żadnego tekstu przed ani po kodzie HTML.
- Nie owijaj w bloki markdown (bez \`\`\`html).
- Użyj tylko inline CSS (żadnych klas, żadnych <style> bloków) — e-maile tego wymagają.
- Zacznij od <div style="..."> i zakończ odpowiadającym </div>.
- Styl wizualny ma przypominać stronę Ligi Elektryka (HomeView): mocny kontrast, brutalistyczne obramowania, czerwony akcent #dc2626 i czerń #000.
- Użyj kolorów: tło białe, akcenty czerwone i czarne, nagłówki uppercase i bardzo wyraźne.
- Tabele mają wyglądać jak w aplikacji: grube obramowania, czytelne nagłówki, mocne oddzielenie sekcji.
- Czcionka: Arial, sans-serif; rozmiar 14px dla tekstu, 20-24px dla nagłówków sekcji.
- ${noCommercialPolicy}

=== WYTYCZNE DLA TYPU REQUESTU ===
${getRequestInstructions(requestType)}
${logoAwarenessText}

=== DANE LIGI ===

DRUŻYNY (${data.teams.length} łącznie):
${teamsSummary}

ROZEGRANE MECZE (${completedMatches.length}):
${matchesSummary || "Brak rozegranych meczów"}

ZAPLANOWANE MECZE (${scheduledMatches.length}):
${scheduledSummary || "Brak zaplanowanych meczów"}

NAJLEPSI STRZELCY (TOP 10):
${topScorersSummary || "Brak danych"}

STATYSTYKI OGÓLNE:
- Łączna liczba drużyn: ${data.teams.length}
- Łączna liczba graczy: ${data.players.length}
- Rozegrane mecze: ${completedMatches.length}
- Zaplanowane mecze: ${scheduledMatches.length}
- Subskrybenci newslettera: ${data.subscribersCount}
- Grupy fazy pierwszej: ${data.firstStage.length}
- Grupy fazy drugiej: ${data.secondStage.length}`;
};

const buildSubjectPrompt = (requestType: RequestType): string => {
  const today = new Date().toLocaleDateString("pl-PL");
  return `Wygeneruj JEDEN temat e-maila po polsku dla newslettera Liga Elektryka.
Wymagania:
- maksymalnie 72 znaki,
- bez cudzysłowów,
- bez emoji,
- konkretny i klikalny,
- zgodny z typem: ${requestType} (${getSubjectHint(requestType)}).
- ${noCommercialPolicy}
Data: ${today}.
Zwróć wyłącznie sam temat.`;
};

const getRewriteToneInstructions = (style: RewriteStyle): string => {
  if (style === "smiesznie") return "Styl: lekko humorystyczny, z wyczuciem, bez cringu.";
  if (style === "formalnie") return "Styl: formalny, profesjonalny, oficjalny.";
  if (style === "krotko") return "Styl: maksymalnie zwięzły i konkretny.";
  return "Styl: neutralny, naturalny, czytelny.";
};

const buildRewritePrompt = (input: {
  requestType: RequestType;
  rewriteStyle: RewriteStyle;
  sourceHtml: string;
  logoAwareness?: boolean;
  logoUrl?: string;
}): string => {
  const logoBlockInstruction = input.logoAwareness
    ? `
- Dodaj blok logo w górnej sekcji treści.
- Użyj dokładnie tego URL logo: ${input.logoUrl || "https://www.ligaelektryka.pl/le_logo.svg"}
`
    : "";

  return dedent`
    Przepisz poniższy HTML newslettera po polsku, zachowując sens i dane.
    ${getRewriteToneInstructions(input.rewriteStyle)}

    Wymagania:
    - zwróć WYŁĄCZNIE HTML (bez markdown),
    - zachowaj styl mailowy (inline CSS),
    - utrzymaj strukturę sekcji i czytelność tabel,
    - styl wizualny ma pasować do strony Liga Elektryka (mocny kontrast, czarne obramowania, czerwony akcent #dc2626),
    - ${noCommercialPolicy}
    ${logoBlockInstruction}

    Typ requestu: ${input.requestType}

    HTML do przepisania:
    ${input.sourceHtml}
  `;
};

const buildRewriteSubjectPrompt = (input: {
  requestType: RequestType;
  rewriteStyle: RewriteStyle;
  sourceSubject: string;
}): string => {
  return dedent`
    Przepisz temat e-maila po polsku.
    ${getRewriteToneInstructions(input.rewriteStyle)}

    Wymagania:
    - maksymalnie 72 znaki,
    - bez cudzysłowów,
    - bez emoji,
    - ma być klikalny i konkretny.
    - ${noCommercialPolicy}

    Typ requestu: ${input.requestType}
    Obecny temat: ${input.sourceSubject}

    Zwróć wyłącznie temat.
  `;
};

const prependLogoToHtml = (html: string, logoUrl: string): string => {
  const logoBlock = dedent`
    <div style="text-align:center;margin:0 0 20px 0;">
      <img src="${logoUrl}" alt="Liga Elektryka" style="max-width:180px;width:100%;height:auto;display:inline-block;" />
    </div>
  `;
  const trimmed = html.trim();
  if (!trimmed) return logoBlock;
  return `${logoBlock}\n${trimmed}`;
};

const ensureLogoInHtml = (input: {
  html: string;
  logoAwareness: boolean;
  logoUrl?: string;
}): string => {
  if (!input.logoAwareness) return input.html;
  const logoUrl = input.logoUrl || "https://www.ligaelektryka.pl/le_logo.svg";
  if (input.html.includes(logoUrl)) {
    return input.html;
  }
  return prependLogoToHtml(input.html, logoUrl);
};

const sanitizeSubject = (value: string): string =>
  value
    .replace(/^"+|"+$/g, "")
    .replace(/\r?\n/g, " ")
    .trim()
    .slice(0, 120);

const stripCommercialLanguage = (value: string): string =>
  value
    .replace(/\b(promoc\w*|promo|zni[zż]k\w*|rabat\w*|kod\w*\s+rabat\w*|kod\w*\s+promocyjn\w*|kupon\w*|pieni[aą]dz\w*|cennik\w*|cena\w*|platn\w*|oplat\w*|sprzedaz\w*|ofert\w*)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const fallbackSubject = (requestType: RequestType): string => {
  const date = new Date().toLocaleDateString("pl-PL");
  if (requestType === "promo") return `Liga Elektryka: Zapowiedz wydarzen (${date})`;
  if (requestType === "recap") return `Liga Elektryka: Podsumowanie tygodnia (${date})`;
  if (requestType === "announcement") return `Liga Elektryka: Ważne ogłoszenie (${date})`;
  return `Liga Elektryka: Sprawozdanie i wyniki (${date})`;
};

// --- Provider call functions ---

const callGemini = async (prompt: string): Promise<string> => {
  const geminiApiKey = getEnv("GEMINI_API_KEY");

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2500, temperature: 0.7 },
      }),
    }
  );

  if (!geminiResponse.ok) {
    const err = await geminiResponse.json().catch(() => ({}));
    const status = geminiResponse.status;
    // 429 = quota exceeded, treat as retriable by throwing so caller can fallback
    throw Object.assign(new Error(`Gemini API error (${status})`), { status, details: err });
  }

  const geminiData = await geminiResponse.json();
  const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
};

const callGroq = async (prompt: string): Promise<string> => {
  const groqApiKey = getEnv("GROQ_API_KEY");

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2500,
      temperature: 0.7,
    }),
  });

  if (!groqResponse.ok) {
    const err = await groqResponse.json().catch(() => ({}));
    throw Object.assign(new Error(`Groq API error (${groqResponse.status})`), { details: err });
  }

  const groqData = await groqResponse.json();
  const text = groqData.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text;
};

const stripMarkdownFences = (html: string): string =>
  html
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Calls the requested provider. If provider is "gemini" and it fails
 * (any error, including quota/429), automatically falls back to Groq.
 * Returns { rawHtml, provider_used, fallback_used }.
 */
const callLLM = async (
  prompt: string,
  provider: "groq" | "gemini"
): Promise<{ rawHtml: string; provider_used: string; fallback_used: boolean }> => {
  if (provider === "gemini") {
    try {
      const rawHtml = await callGemini(prompt);
      return { rawHtml, provider_used: "gemini", fallback_used: false };
    } catch (err) {
      console.warn("Gemini failed, falling back to Groq:", err instanceof Error ? err.message : err);
      const rawHtml = await callGroq(prompt);
      return { rawHtml, provider_used: "groq", fallback_used: true };
    }
  }

  // Default: Groq
  const rawHtml = await callGroq(prompt);
  return { rawHtml, provider_used: "groq", fallback_used: false };
};

// --- Email template ---

const emailStyles = {
  body: "margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;",
  outerTable: "background:#ffffff;padding:24px 0;",
  card: "background:#ffffff;border:4px solid #000000;box-shadow:10px 10px 0 #dc2626;",
  header: "background:#000000;padding:20px 24px;border-bottom:4px solid #dc2626;",
  badge: "display:inline-block;border:2px solid #ffffff;background:#dc2626;color:#ffffff;padding:4px 8px;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;",
  title: "margin:10px 0 0;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:1px;text-transform:uppercase;",
  subtitle: "margin:6px 0 0;font-size:12px;color:#f0f0f0;font-weight:700;",
  content: "padding:24px;border-top:2px solid #000000;",
  footer: "padding:16px 24px;border-top:4px solid #000000;background:#fafafa;",
  footerPrimary: "margin:0;font-size:11px;color:#444444;font-weight:700;",
  footerSecondary: "margin:8px 0 0;font-size:11px;color:#444444;",
} as const;

const renderEmailHeader = (subject: string): string => dedent`
  <tr>
    <td style="${emailStyles.header}">
      <span style="${emailStyles.badge}">NEWSLETTER</span>
      <h1 style="${emailStyles.title}">LIGA ELEKTRYKA</h1>
      <p style="${emailStyles.subtitle}">${escapeHtml(subject)}</p>
    </td>
  </tr>
`;

const renderEmailFooter = (generatedAt: string): string => dedent`
  <tr>
    <td style="${emailStyles.footer}">
      <p style="${emailStyles.footerPrimary}">
        Wygenerowano automatycznie · ${new Date(generatedAt).toLocaleString("pl-PL")}
      </p>
      <p style="${emailStyles.footerSecondary}">
        Aby wypisać się z newslettera, odpowiedz na tego e-maila z tytułem "Wypisz mnie".
      </p>
    </td>
  </tr>
`;

const wrapInEmailTemplate = (
  innerHtml: string,
  generatedAt: string,
  subject: string,
): string => dedent`
  <!DOCTYPE html>
  <html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="${emailStyles.body}">
    <table width="100%" cellpadding="0" cellspacing="0" style="${emailStyles.outerTable}">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="${emailStyles.card}">
            ${renderEmailHeader(subject)}
            <tr>
              <td style="${emailStyles.content}">
                ${innerHtml}
              </td>
            </tr>
            ${renderEmailFooter(generatedAt)}
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// --- Main handler ---

const generateReport = async (req: Request): Promise<Response> => {
  const authError = await requireAuthUser(req);
  if (authError) return authError;

  // Parse optional body: { provider?: "groq" | "gemini", request_type?: RequestType, mode?: GenerationMode }
  let provider: "groq" | "gemini" = "groq";
  let requestType: RequestType = "report";
  let mode: GenerationMode = "generate";
  let rewriteStyle: RewriteStyle = "normalnie";
  let sourceHtml = "";
  let sourceSubject = "";
  let logoAwareness = false;
  let logoUrl: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.provider === "gemini") provider = "gemini";
    if (
      body?.request_type === "report" ||
      body?.request_type === "promo" ||
      body?.request_type === "recap" ||
      body?.request_type === "announcement"
    ) {
      requestType = body.request_type;
    }
    if (body?.mode === "rewrite") {
      mode = "rewrite";
    }
    if (
      body?.rewrite_style === "normalnie" ||
      body?.rewrite_style === "smiesznie" ||
      body?.rewrite_style === "formalnie" ||
      body?.rewrite_style === "krotko"
    ) {
      rewriteStyle = body.rewrite_style;
    }
    if (typeof body?.source_html === "string") {
      sourceHtml = body.source_html;
    }
    if (typeof body?.source_subject === "string") {
      sourceSubject = body.source_subject;
    }
    if (body?.logo_awareness === true) {
      logoAwareness = true;
    }
    if (typeof body?.logo_url === "string" && body.logo_url.trim().length > 0) {
      logoUrl = body.logo_url.trim();
    }
  } catch {
    // no body or invalid JSON — use default
  }

  const supabase = createAdminClient();

  let data: Awaited<ReturnType<typeof fetchAllData>> | null = null;
  let prompt = "";
  let subjectPrompt = "";

  if (mode === "rewrite") {
    if (!sourceHtml.trim()) {
      return json(400, { error: "source_html is required in rewrite mode" });
    }

    prompt = buildRewritePrompt({
      requestType,
      rewriteStyle,
      sourceHtml,
      logoAwareness,
      logoUrl,
    });
    subjectPrompt = buildRewriteSubjectPrompt({
      requestType,
      rewriteStyle,
      sourceSubject: sourceSubject.trim() || fallbackSubject(requestType),
    });
  } else {
    try {
      data = await fetchAllData(supabase);
    } catch (err) {
      return json(500, { error: "Failed to fetch data", details: String(err) });
    }

    prompt = buildPrompt(data, requestType, {
      logoAwareness,
      logoUrl,
    });
    subjectPrompt = buildSubjectPrompt(requestType);
  }

  let llmResult: Awaited<ReturnType<typeof callLLM>>;
  let subjectResult: Awaited<ReturnType<typeof callLLM>> | null = null;
  try {
    llmResult = await callLLM(prompt, provider);
    subjectResult = await callLLM(subjectPrompt, provider);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown LLM error";
    return json(500, { error: "LLM API error", details: message });
  }

  const cleanedHtml = stripMarkdownFences(llmResult.rawHtml);
  const htmlWithLogo = ensureLogoInHtml({
    html: cleanedHtml,
    logoAwareness,
    logoUrl,
  });
  const rawSubject = subjectResult ? stripMarkdownFences(subjectResult.rawHtml) : "";
  const subject = stripCommercialLanguage(sanitizeSubject(rawSubject)) || fallbackSubject(requestType);
  const generatedAt = new Date().toISOString();
  const sanitizedInnerHtml = stripCommercialLanguage(htmlWithLogo);
  const html = wrapInEmailTemplate(sanitizedInnerHtml, generatedAt, subject);

  return json(200, {
    html,
    subject,
    mode,
    rewrite_style: rewriteStyle,
    request_type: requestType,
    generated_at: generatedAt,
    provider_used: llmResult.provider_used,
    fallback_used: llmResult.fallback_used,
    stats: {
      teams: data?.teams.length ?? null,
      players: data?.players.length ?? null,
      completed_matches: data ? data.matches.filter((m) => m.status === "completed").length : null,
      scheduled_matches: data ? data.matches.filter((m) => m.status === "scheduled").length : null,
      top_scorer: data?.topScorers?.[0]
        ? `${data.topScorers[0].player_name} (${data.topScorers[0].goals} goli)`
        : null,
    },
  });
};

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      return json(200, { ok: true, function: "report-generator" });
    }

    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    return await generateReport(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json(500, { error: message });
  }
});