import { apiClient } from "@/shared/lib/api-client";

export type CommercialGoal =
  | "increase_sales"
  | "raise_ticket"
  | "attract_new"
  | "bring_back"
  | "sell_category"
  | "encourage_combo"
  | "order_threshold";

export type CampaignStatus = "draft" | "active" | "paused" | "ended";
export type RecurrenceType = "once" | "daily" | "weekdays" | "hours" | "commemorative";

export type CampaignAdmin = {
  id: string;
  commercial_goal: CommercialGoal;
  mechanism: string;
  status: CampaignStatus;
  title: string;
  product_id: string;
  product_name: string;
  promo_price: number;
  reference_price: number;
  recurrence_type: RecurrenceType;
  weekdays: number[];
  starts_at: string;
  ends_at: string | null;
  show_on_home: boolean;
  show_on_menu: boolean;
  show_on_product: boolean;
  link_only: boolean;
  show_as_banner: boolean;
  save_amount: number | null;
  discount_percent: number | null;
  badges: string[];
  created_at: string;
  updated_at: string;
};

export type CampaignCreatePayload = {
  commercial_goal: CommercialGoal;
  product_id: string;
  promo_price: number;
  recurrence_type: RecurrenceType;
  weekdays?: number[];
  starts_at?: string;
  ends_at?: string | null;
  show_on_home?: boolean;
  show_on_menu?: boolean;
  show_on_product?: boolean;
  link_only?: boolean;
  title?: string;
};

export type PublicOffer = {
  campaign_id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  image_url: string | null;
  promo_price: number;
  reference_price: number;
  save_amount: number;
  discount_percent: number;
  badges: string[];
  title: string;
  ends_at: string | null;
  is_available: boolean;
};

export const promotionsAdminApi = {
  list: (params?: { status?: string }) =>
    apiClient.get<CampaignAdmin[]>("/admin/campaigns/", { params }).then((r) => r.data),

  create: (payload: CampaignCreatePayload) =>
    apiClient.post<CampaignAdmin>("/admin/campaigns/", payload).then((r) => r.data),

  update: (id: string, payload: Partial<CampaignCreatePayload> & { status?: CampaignStatus }) =>
    apiClient.patch<CampaignAdmin>(`/admin/campaigns/${id}/`, payload).then((r) => r.data),
};

export const promotionsPublicApi = {
  offers: () => apiClient.get<PublicOffer[]>("/public/promotions/offers/").then((r) => r.data),
};
