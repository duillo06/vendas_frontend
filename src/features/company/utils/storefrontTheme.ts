import { deliveryWindowLabel } from "@/features/storefront/utils/shopHours";

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
  instagram_url?: string;
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

// faixa definida pela loja; sem ela, monta a janela em volta do tempo antigo
export function getDeliveryTimeLabel(company?: CompanyPublic | null): string | null {
  const marketing = getStorefrontMarketing(company);
  if (marketing.show_delivery_time === false) {
    return null;
  }

  const low = company?.settings.delivery_time_min;
  const high = company?.settings.delivery_time_max;
  if (low && high && high >= low) {
    return low === high ? `${low} min` : `${low}-${high} min`;
  }

  return deliveryWindowLabel(getEstimatedDeliveryMinutes(company));
}
