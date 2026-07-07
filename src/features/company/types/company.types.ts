export interface CompanySettingsPublic {
  min_order_value: number;
  delivery_fee: number;
  free_delivery_above: number | null;
  estimated_prep_time: number;
  estimated_delivery_time: number;
  accepts_delivery: boolean;
  accepts_pickup: boolean;
  payment_methods: string[];
}

export interface BusinessHoursPublic {
  day_of_week: number;
  day_name: string;
  opens_at: string;
  closes_at: string;
  is_closed: boolean;
}

export interface CompanyPublic {
  id: string;
  trade_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  phone: string | null;
  is_open: boolean;
  settings: CompanySettingsPublic;
  business_hours: BusinessHoursPublic[];
}
