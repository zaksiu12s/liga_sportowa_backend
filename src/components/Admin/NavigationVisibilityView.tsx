import { useEffect, useState } from "react";
import { DEFAULT_NAV_ITEMS } from "../../config/navigation";
import type { NavItem } from "../../types/navigation";
import { mergeNavItemsWithSettings, navigationSettingsApi } from "../../utils/navigationSettings";
import { useToast } from "./Toast";

export const NavigationVisibilityView = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [loading, setLoading] = useState(true);
  const [savingPath, setSavingPath] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        await navigationSettingsApi.ensureDefaults();
        const settings = await navigationSettingsApi.getAll();
        setItems(mergeNavItemsWithSettings(DEFAULT_NAV_ITEMS, settings));
      } catch (error) {
        console.error("Failed to load navigation settings:", error);
        showToast(
          "Nie mozna pobrac ustawien menu. Sprawdz tabele navigation_settings w Supabase.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [showToast]);

  const handleToggle = async (item: NavItem) => {
    const nextItem: NavItem = { ...item, isHidden: !item.isHidden };

    setItems((prev) => prev.map((entry) => (entry.path === item.path ? nextItem : entry)));
    setSavingPath(item.path);

    try {
      await navigationSettingsApi.upsert(nextItem);
      window.dispatchEvent(new Event("nav-visibility-updated"));
      showToast("Ustawienia menu zapisane", "success", 1500);
    } catch (error) {
      console.error("Failed to update navigation visibility:", error);
      setItems((prev) => prev.map((entry) => (entry.path === item.path ? item : entry)));
      showToast("Blad zapisu ustawien menu", "error");
    } finally {
      setSavingPath(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-2 border-black p-8">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-2 border-black border-r-transparent animate-spin mb-4"></div>
          <p className="font-black uppercase text-xs tracking-widest">Ladowanie ustawien nawigacji...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black p-8 space-y-6">
      <div>
        <h3 className="text-lg font-black uppercase tracking-widest border-b-2 border-black pb-4">
          WIDOCZNOSC LINKOW MENU
        </h3>
        <p className="mt-3 text-sm text-gray-600">
          Ukryte pozycje nie beda widoczne dla uzytkownika w headerze.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const isSaving = savingPath === item.path;

          return (
            <div
              key={item.path}
              className="flex items-center justify-between border-2 border-black p-4"
            >
              <div>
                <p className="font-black uppercase text-sm tracking-widest">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.path}</p>
              </div>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleToggle(item)}
                className={`px-4 py-2 border-2 font-black text-xs uppercase tracking-widest transition-colors ${
                  item.isHidden
                    ? "bg-red-600 border-red-600 text-white hover:bg-red-500"
                    : "bg-green-100 border-green-600 text-green-900 hover:bg-green-200"
                } ${isSaving ? "opacity-70 cursor-wait" : ""}`}
              >
                {isSaving ? "Zapisywanie..." : item.isHidden ? "Ukryte" : "Widoczne"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
