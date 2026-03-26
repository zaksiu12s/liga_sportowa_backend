// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";

type QueueRow = {
  id: string;
  email: string;
  subject: string;
  html: string;
  retries: number | null;
};

type MailerRequest = {
  subject?: string;
  html?: string;
  scheduled_at?: string;
};

type UpdateQueueRequest = {
  id?: string;
  subject?: string;
  html?: string;
  scheduled_at?: string;
};

type DeleteQueueRequest = {
  id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mailer-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });

const getEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const normalizeRoute = (pathname: string): string => {
  const cleaned = pathname.replace(/^\/+/, "");
  const withoutFunctionName = cleaned.startsWith("mailer")
    ? cleaned.slice("mailer".length)
    : cleaned;

  return withoutFunctionName.replace(/^\/+/, "");
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const requireOptionalToken = (
  req: Request,
  envKey: "MAILER_ENQUEUE_TOKEN" | "MAILER_PROCESS_TOKEN",
): Response | null => {
  const configuredToken = Deno.env.get(envKey);
  if (!configuredToken) {
    return null;
  }

  const providedToken = req.headers.get("x-mailer-token");
  if (providedToken !== configuredToken) {
    return json(401, { error: "Unauthorized" });
  }

  return null;
};

const createAdminClient = () => {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const requireAuthUser = async (req: Request): Promise<Response | null> => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json(401, { error: "Unauthorized" });
  }

  const supabaseClient = createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_ANON_KEY"),
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) {
    return json(401, { error: "Unauthorized" });
  }

  return null;
};

const enqueue = async (req: Request): Promise<Response> => {
  const authError = await requireAuthUser(req);
  if (authError) return authError;

  const tokenError = requireOptionalToken(req, "MAILER_ENQUEUE_TOKEN");
  if (tokenError) {
    return tokenError;
  }

  let body: MailerRequest;
  try {
    body = (await req.json()) as MailerRequest;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const subject = body.subject?.trim();
  const html = body.html?.trim();

  if (!subject) {
    return json(400, { error: "Field 'subject' is required" });
  }

  if (!html) {
    return json(400, { error: "Field 'html' is required" });
  }

  const scheduledAt = body.scheduled_at
    ? new Date(body.scheduled_at)
    : new Date();

  if (Number.isNaN(scheduledAt.getTime())) {
    return json(400, { error: "Invalid value for 'scheduled_at'" });
  }

  const supabase = createAdminClient();

  const { data: subscribers, error: subscribersError } = await supabase
    .from("subscribers")
    .select("email");

  if (subscribersError) {
    return json(500, {
      error: "Failed to read subscribers",
      details: subscribersError.message,
    });
  }

  const uniqueEmails = Array.from(
    new Set((subscribers ?? []).map((item) => item.email).filter(Boolean)),
  );

  if (uniqueEmails.length === 0) {
    return json(200, { queued: 0, message: "No subscribers found" });
  }

  const rows = uniqueEmails.map((email) => ({
    email,
    subject,
    html,
    status: "pending",
    retries: 0,
    scheduled_at: scheduledAt.toISOString(),
  }));

  const { error: insertError } = await supabase.from("mail_queue").insert(rows);

  if (insertError) {
    return json(500, {
      error: "Failed to enqueue mails",
      details: insertError.message,
    });
  }

  return json(200, {
    queued: rows.length,
    scheduled_at: scheduledAt.toISOString(),
  });
};

const updateScheduledQueueItem = async (req: Request): Promise<Response> => {
  const authError = await requireAuthUser(req);
  if (authError) return authError;

  const tokenError = requireOptionalToken(req, "MAILER_ENQUEUE_TOKEN");
  if (tokenError) return tokenError;

  let body: UpdateQueueRequest;
  try {
    body = (await req.json()) as UpdateQueueRequest;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const id = body.id?.trim();
  const subject = body.subject?.trim();
  const html = body.html?.trim();
  const scheduledAt = body.scheduled_at ? new Date(body.scheduled_at) : null;

  if (!id) return json(400, { error: "Field 'id' is required" });
  if (!subject) return json(400, { error: "Field 'subject' is required" });
  if (!html) return json(400, { error: "Field 'html' is required" });
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    return json(400, { error: "Invalid value for 'scheduled_at'" });
  }

  const supabase = createAdminClient();

  const { data: queueRow, error: readError } = await supabase
    .from("mail_queue")
    .select("id, status, sent_at")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return json(500, {
      error: "Failed to read queue item",
      details: readError.message,
    });
  }

  if (!queueRow) {
    return json(404, { error: "Queue item not found" });
  }

  if (queueRow.status === "sent" || queueRow.sent_at) {
    return json(409, { error: "Sent emails cannot be edited" });
  }

  const { error: updateError } = await supabase
    .from("mail_queue")
    .update({
      subject,
      html,
      scheduled_at: scheduledAt.toISOString(),
      status: "pending",
    })
    .eq("id", id);

  if (updateError) {
    return json(500, {
      error: "Failed to update queue item",
      details: updateError.message,
    });
  }

  return json(200, { updated: true, id });
};

const deleteScheduledQueueItem = async (req: Request): Promise<Response> => {
  const authError = await requireAuthUser(req);
  if (authError) return authError;

  const tokenError = requireOptionalToken(req, "MAILER_ENQUEUE_TOKEN");
  if (tokenError) return tokenError;

  let body: DeleteQueueRequest;
  try {
    body = (await req.json()) as DeleteQueueRequest;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const id = body.id?.trim();
  if (!id) return json(400, { error: "Field 'id' is required" });

  const supabase = createAdminClient();

  const { data: queueRow, error: readError } = await supabase
    .from("mail_queue")
    .select("id, status, sent_at")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    return json(500, {
      error: "Failed to read queue item",
      details: readError.message,
    });
  }

  if (!queueRow) {
    return json(404, { error: "Queue item not found" });
  }

  if (queueRow.status === "sent" || queueRow.sent_at) {
    return json(409, { error: "Sent emails cannot be deleted" });
  }

  const { error: deleteError } = await supabase
    .from("mail_queue")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return json(500, {
      error: "Failed to delete queue item",
      details: deleteError.message,
    });
  }

  return json(200, { deleted: true, id });
};

const sendViaResend = async (
  apiKey: string,
  from: string,
  row: QueueRow,
): Promise<{ ok: true; providerMessageId: string | null } | { ok: false; reason: string }> => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [row.email],
      subject: row.subject,
      html: row.html,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
    message?: string;
  };

  if (!response.ok) {
    return {
      ok: false,
      reason:
        payload.error?.message || payload.message || `Resend error ${response.status}`,
    };
  }

  return {
    ok: true,
    providerMessageId: payload.id ?? null,
  };
};

const processQueue = async (req: Request): Promise<Response> => {
  const tokenError = requireOptionalToken(req, "MAILER_PROCESS_TOKEN");
  if (tokenError) {
    return tokenError;
  }

  const resendApiKey = getEnv("RESEND_API_KEY");
  const mailFrom = getEnv("MAIL_FROM");
  const batchSize = parsePositiveInt(Deno.env.get("MAILER_BATCH_SIZE"), 50);
  const maxRetries = parsePositiveInt(Deno.env.get("MAILER_MAX_RETRIES"), 3);

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: queueRows, error: queueError } = await supabase
    .from("mail_queue")
    .select("id, email, subject, html, retries")
    .in("status", ["pending", "failed"])
    .or(`retries.is.null,retries.lt.${maxRetries}`)
    .lte("scheduled_at", nowIso)
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (queueError) {
    return json(500, {
      error: "Failed to read mail queue",
      details: queueError.message,
    });
  }

  const items = (queueRows ?? []) as QueueRow[];

  if (items.length === 0) {
    return json(200, {
      processed: 0,
      sent: 0,
      failed: 0,
      message: "No queue rows ready to process",
    });
  }

  let sent = 0;
  let failed = 0;
  const failures: Array<{ id: string; email: string; reason: string }> = [];

  for (const row of items) {
    const result = await sendViaResend(resendApiKey, mailFrom, row);

    if (result.ok) {
      const { error: updateError } = await supabase
        .from("mail_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: result.providerMessageId,
        })
        .eq("id", row.id);

      if (updateError) {
        failed += 1;
        failures.push({
          id: row.id,
          email: row.email,
          reason: `Sent but failed to update row: ${updateError.message}`,
        });
      } else {
        sent += 1;
      }

      continue;
    }

    const nextRetries = (row.retries ?? 0) + 1;

    const { error: failUpdateError } = await supabase
      .from("mail_queue")
      .update({
        status: "failed",
        retries: nextRetries,
      })
      .eq("id", row.id);

    failed += 1;
    failures.push({
      id: row.id,
      email: row.email,
      reason:
        failUpdateError?.message
          ? `Failed to update retry state: ${failUpdateError.message}`
          : result.reason,
    });
  }

  return json(200, {
    processed: items.length,
    sent,
    failed,
    failures: failures.slice(0, 20),
    batch_size: batchSize,
    max_retries: maxRetries,
  });
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const route = normalizeRoute(url.pathname);

  try {
    if (req.method === "GET") {
      return json(200, {
        ok: true,
        function: "mailer",
        routes: [
          "POST /mailer",
          "POST /mailer/enqueue",
          "POST /mailer/process",
          "POST /mailer/update",
          "POST /mailer/delete",
        ],
      });
    }

    if (req.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    if (route === "" || route === "enqueue") {
      return await enqueue(req);
    }

    if (route === "process") {
      return await processQueue(req);
    }

    if (route === "update") {
      return await updateScheduledQueueItem(req);
    }

    if (route === "delete") {
      return await deleteScheduledQueueItem(req);
    }

    return json(404, { error: `Unknown route: ${route}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return json(500, { error: message });
  }
});