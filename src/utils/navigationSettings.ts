import { DEFAULT_NAV_ITEMS } from "../config/navigation";
import type { NavItem, NavigationSetting } from "../types/navigation";
import supabase from "./supabase";

const TABLE_NAME = "navigation_settings";

export const navigationSettingsApi = {
  async getAll(): Promise<NavigationSetting[]> {
    const { data, error } = await (supabase as any)
      .from(TABLE_NAME)
      .select("path, label, is_hidden, updated_at");

    if (error) throw error;
    return (data || []) as NavigationSetting[];
  },

  async upsert(item: NavItem): Promise<void> {
    const payload = {
      path: item.path,
      label: item.label,
      is_hidden: item.isHidden,
    };

    const { error } = await (supabase as any)
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: "path" });

    if (error) throw error;
  },

  async ensureDefaults(): Promise<void> {
    const payload = DEFAULT_NAV_ITEMS.map((item) => ({
      path: item.path,
      label: item.label,
      is_hidden: item.isHidden,
    }));

    const { error } = await (supabase as any)
      .from(TABLE_NAME)
      .upsert(payload, { onConflict: "path", ignoreDuplicates: true });

    if (error) throw error;
  },
};

export const mergeNavItemsWithSettings = (
  baseItems: NavItem[],
  settings: NavigationSetting[]
): NavItem[] => {
  const settingsMap = new Map(settings.map((item) => [item.path, item]));

  return baseItems.map((item) => {
    const matched = settingsMap.get(item.path);
    if (!matched) return item;

    return {
      ...item,
      label: matched.label || item.label,
      isHidden: matched.is_hidden,
    };
  });
};
