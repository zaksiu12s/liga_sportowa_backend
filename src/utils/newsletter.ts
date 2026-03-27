import supabase from "./supabase";

const NEWSLETTER_PROMPT_SEEN_COOKIE = "newsletter_prompt_seen";
const NEWSLETTER_PROMPT_TIMER_COOKIE = "newsletter_prompt_timer_started_at";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10;

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookieParts = document.cookie.split(";");

  for (const part of cookieParts) {
    const cookie = part.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
};

const writeCookie = (name: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

export const hasNewsletterPromptBeenSeen = () => readCookie(NEWSLETTER_PROMPT_SEEN_COOKIE) === "1";

export const markNewsletterPromptSeen = () => {
  writeCookie(NEWSLETTER_PROMPT_SEEN_COOKIE, "1");
  writeCookie(NEWSLETTER_PROMPT_TIMER_COOKIE, "", 0);
};

export const getNewsletterPromptTimerStartedAt = (): number | null => {
  const rawValue = readCookie(NEWSLETTER_PROMPT_TIMER_COOKIE);
  if (!rawValue) {
    return null;
  }

  const timestamp = Number(rawValue);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const setNewsletterPromptTimerStartedAt = (timestamp: number) => {
  writeCookie(NEWSLETTER_PROMPT_TIMER_COOKIE, String(timestamp));
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterSubscribeResult = "subscribed" | "already-subscribed";

export const subscribeToNewsletter = async (
  emailInput: string,
): Promise<NewsletterSubscribeResult> => {
  const email = emailInput.trim().toLowerCase();

  if (!emailRegex.test(email)) {
    throw new Error("Podaj poprawny adres e-mail.");
  }

  const { data: existing, error: existingError } = await (supabase as any)
    .from("subscribers")
    .select("id")
    .eq("email", email)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  if (Array.isArray(existing) && existing.length > 0) {
    return "already-subscribed";
  }

  const { error: insertError } = await (supabase as any)
    .from("subscribers")
    .insert([{ email }]);

  if (insertError) {
    if (
      typeof insertError.message === "string" &&
      insertError.message.toLowerCase().includes("duplicate")
    ) {
      return "already-subscribed";
    }

    throw insertError;
  }

  return "subscribed";
};
