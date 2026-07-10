import type { CompanyPublic } from "../types/company.types";

export type StorefrontMarketing = {
  slogan?: string;
  show_rating?: boolean;
  rating?: number;
  show_orders_count?: boolean;
  orders_count?: number;
  promo_label?: string;
  promo_url?: string;
  show_delivery_time?: boolean;
};

export function getStorefrontMarketing(company?: CompanyPublic | null): StorefrontMarketing {
  const raw = company?.theme as { storefront?: StorefrontMarketing } | null | undefined;
  return raw?.storefront ?? {};
}

export function getEstimatedDeliveryMinutes(company?: CompanyPublic | null): number | null {
  const marketing = getStorefrontMarketing(company);
  if (marketing.show_delivery_time === false) {
    return null;
  }

  const prep = company?.settings.estimated_prep_time;
  const delivery = company?.settings.estimated_delivery_time;
  if (!prep && !delivery) return null;
  return (prep ?? 0) + (delivery ?? 0);
}
