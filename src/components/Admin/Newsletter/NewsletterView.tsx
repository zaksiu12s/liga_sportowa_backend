import { useEffect, useMemo, useState } from "react";
import type { MailQueueItem, Subscriber } from "../../../types/admin";
import { newsletterApi } from "../../../utils/adminSupabase";
import { useToast } from "../Toast";
import supabase from "../../../utils/supabase";

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

export const NewsletterView = () => {
  const { showToast } = useToast();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [queueItems, setQueueItems] = useState<MailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<h1>Czesc!</h1>");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAtLocal, setScheduledAtLocal] = useState("");

  const pendingCount = useMemo(
    () => queueItems.filter((item) => item.status === "pending").length,
    [queueItems],
  );

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "report-generator",
        {
          body: {},
        },
      );

      if (error) throw error;

      setHtml(
        `<h1>Sprawozdanie Ligi Elektryka</h1>\n<p>${(data.report as string).replace(/\n/g, "</p>\n<p>")}</p>`,
      );
      showToast("Sprawozdanie wygenerowane!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Błąd generowania sprawozdania",
        "error",
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
      console.error("Failed to load newsletter data:", error);
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
      setHtml("<h1>Czesc!</h1>");
      setIsScheduled(false);
      setScheduledAtLocal("");

      await loadData();
    } catch (error) {
      console.error("Failed to enqueue newsletter:", error);
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
          <div className="inline-block w-12 h-12 border-2 border-black border-r-transparent animate-spin mb-4"></div>
          <p className="font-black uppercase text-sm tracking-widest">
            Loading newsletter...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white border-2 border-black p-6">
        <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black pb-3">
          Create Newsletter Queue
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Newsletter subject"
              className="w-full border-2 border-black px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-widest">
                HTML Content
              </label>
              <button
                type="button"
                onClick={() => void handleGenerateReport()}
                disabled={isGeneratingReport || isSubmitting}
                className="flex items-center gap-2 px-3 py-1 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <>
                    <span className="inline-block w-3 h-3 border border-white border-r-transparent animate-spin" />
                    Generowanie...
                  </>
                ) : (
                  <>✦ Generuj AI</>
                )}
              </button>
            </div>
            <textarea
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              rows={10}
              className="w-full border-2 border-black px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="border-2 border-black p-4 bg-gray-50 space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(event) => setIsScheduled(event.target.checked)}
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
                  onChange={(event) => setScheduledAtLocal(event.target.value)}
                  className="border-2 border-black px-3 py-2 text-sm font-semibold"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Worker sends only rows where scheduled_at is earlier or equal
                  to current time.
                </p>
              </div>
            )}
          </div>

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
                </tr>
              ))}
            </tbody>
          </table>

          {queueItems.length === 0 && (
            <div className="p-4 text-sm text-gray-600">Queue is empty.</div>
          )}
        </div>
      </div>
    </div>
  );
};
