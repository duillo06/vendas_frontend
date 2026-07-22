export interface StorefrontThemeConfig {
  slogan?: string;
  show_rating?: boolean;
  rating?: number;
  show_orders_count?: boolean;
  orders_count?: number;
  promo_label?: string;
  promo_url?: string;
  show_delivery_time?: boolean;
  instagram_url?: string;
}

export interface TenantTheme {
  primary?: string;
  primary_foreground?: string;
  accent?: string;
  accent_foreground?: string;
  radius?: string;
  storefront?: StorefrontThemeConfig;
}

export interface CompanySetupState {
  status: "pending" | "completed" | "dismissed" | string;
  segment: string | null;
  steps: string[];
  completed_at?: string | null;
  dismissed_at?: string | null;
}

export interface CompanySettingsAdmin {
  min_order_value: number;
  delivery_fee: number;
  free_delivery_above: number | null;
  estimated_prep_time: number;
  estimated_delivery_time: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  delivery_city?: string;
  delivery_state?: string;
  is_open: boolean;
  auto_close_outside_hours: boolean;
  payment_methods: string[];
  theme: TenantTheme | null;
  setup?: CompanySetupState | null;
}

export interface CompanyAdmin {
  legal_name: string;
  trade_name: string;
  document: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
}

export interface BusinessHoursAdmin {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

export interface SettingsData {
  company: CompanyAdmin;
  settings: CompanySettingsAdmin;
  business_hours: BusinessHoursAdmin[];
}

export interface UpdateSettingsPayload {
  company?: Partial<CompanyAdmin>;
  settings?: Partial<CompanySettingsAdmin>;
  business_hours?: BusinessHoursAdmin[];
}
