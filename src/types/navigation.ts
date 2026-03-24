export interface NavItem {
  path: string;
  label: string;
  isHidden: boolean;
}

export interface NavigationSetting {
  path: string;
  label: string;
  is_hidden: boolean;
  updated_at?: string;
}
