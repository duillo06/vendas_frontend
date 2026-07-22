import { Flame, Gift, Percent, Sparkles, Truck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import type { CompanyPublic } from "@/features/company/types/company.types";
import { getStorefrontMarketing } from "@/features/company/utils/storefrontTheme";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { productHasMatcher, TAG_MATCHERS } from "@/features/catalog/utils/productTags";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export type InsightChip = {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  tone?: "brand" | "hot" | "fresh" | "sale";
};

export function buildHomeInsightChips(
  company: CompanyPublic | null | undefined,
  products: ProductListItem[],
): InsightChip[] {
  const chips: InsightChip[] = [];
  const marketing = getStorefrontMarketing(company);
  const available = products.filter((p) => p.is_available);

  if (marketing.promo_label) {
    chips.push({
      id: "promo",
      label: marketing.promo_label,
      icon: Gift,
      to: marketing.promo_url ?? "/cardapio",
      tone: "sale",
    });
  }

  const freeAbove = company?.settings.free_delivery_above;
  if (freeAbove != null && Number(freeAbove) > 0) {
    chips.push({
      id: "free-ship",
      label: `Frete grátis acima de ${formatCurrency(freeAbove)}`,
      icon: Truck,
      tone: "brand",
    });
  }

  if (company?.settings.delivery_fee === 0 && company.settings.accepts_delivery) {
    chips.push({
      id: "zero-fee",
      label: "Entrega sem taxa",
      icon: Zap,
      tone: "brand",
    });
  }

  const bestSeller = available.find((p) => productHasMatcher(p.tags, TAG_MATCHERS.bestsellers));
  if (bestSeller) {
    chips.push({
      id: "best",
      label: bestSeller.name,
      icon: Flame,
      to: `/produto/${bestSeller.slug}`,
      tone: "hot",
    });
  }

  const novelty = available.find((p) => productHasMatcher(p.tags, TAG_MATCHERS.launches));
  if (novelty) {
    chips.push({
      id: "new",
      label: `Novidade: ${novelty.name}`,
      icon: Sparkles,
      to: `/produto/${novelty.slug}`,
      tone: "fresh",
    });
  }

  const promoProduct = available.find(
    (p) => p.compare_price != null && Number(p.compare_price) > Number(p.base_price),
  );
  if (promoProduct && !chips.some((c) => c.id === "promo")) {
    chips.push({
      id: "deal",
      label: `Promo: ${promoProduct.name}`,
      icon: Percent,
      to: `/produto/${promoProduct.slug}`,
      tone: "sale",
    });
  }

  return chips.slice(0, 6);
}

const toneClass = {
  brand: "border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary-soft))] text-brand",
  hot: "border-orange-200 bg-orange-50 text-orange-800",
  fresh: "border-emerald-200 bg-emerald-50 text-emerald-800",
  sale: "border-rose-200 bg-rose-50 text-rose-800",
} as const;

type HomeInsightRailProps = {
  chips: InsightChip[];
};

export function HomeInsightRail({ chips }: HomeInsightRailProps) {
  if (!chips.length) return null;

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]">
      {chips.map((chip) => {
        const Icon = chip.icon;
        const className = cn(
          "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold shadow-[var(--shadow-xs)] transition active:scale-[0.98]",
          toneClass[chip.tone ?? "brand"],
        );

        if (chip.to) {
          return (
            <Link key={chip.id} to={chip.to} className={className}>
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[11rem] truncate">{chip.label}</span>
            </Link>
          );
        }

        return (
          <span key={chip.id} className={className}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[11rem] truncate">{chip.label}</span>
          </span>
        );
      })}
    </div>
  );
}
