import type { NavItem } from "../types/navigation";

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { path: "/", label: "START", isHidden: true },
  { path: "/teams", label: "DRUŻYNY", isHidden: true },
  { path: "/schedule", label: "MECZE", isHidden: true },
  { path: "/standings", label: "TABELE", isHidden: true },
  { path: "/finals", label: "FINAŁY", isHidden: true },
  { path: "/scorers", label: "STRZELCY", isHidden: true },
];
