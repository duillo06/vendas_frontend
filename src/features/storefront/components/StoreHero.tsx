import { ArrowRight, Clock, Star, Store, Tag, Truck } from "lucide-react";
import { Link } from "react-router";

import {
  getEstimatedDeliveryMinutes,
  getStorefrontMarketing,
} from "@/features/company/utils/storefrontTheme";
import type { CompanyPublic } from "@/features/company/types/company.types";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type StoreHeroProps = {
  company?: CompanyPublic | null;
  isLoading?: boolean;
  /** na home os produtos já estão logo abaixo — CTA vira ruído */
  showCta?: boolean;
};

function StoreMetaChips({
  company,
  marketing,
  deliveryMinutes,
  inverted,
}: {
  company?: CompanyPublic | null;
  marketing: ReturnType<typeof getStorefrontMarketing>;
  deliveryMinutes: number | null;
  inverted?: boolean;
}) {
  const chipClass = inverted
    ? "bg-white/15 text-white ring-1 ring-white/20"
    : "bg-white/80 text-[hsl(var(--foreground))] ring-1 ring-[hsl(var(--border))]";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
          chipClass,
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            company?.is_open ? "bg-emerald-400" : "bg-amber-400",
          )}
        />
        {company?.is_open ? "Aberto" : "Fechado"}
      </span>

      {deliveryMinutes ? (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs", chipClass)}>
          <Clock className="h-3 w-3 shrink-0" />
          {storefrontCopy.home.deliveryEstimate(deliveryMinutes)}
        </span>
      ) : null}

      {marketing.show_rating && marketing.rating ? (
        <span className={cn("hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:text-xs", chipClass)}>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {storefrontCopy.home.rating(marketing.rating)}
        </span>
      ) : null}

      {marketing.show_orders_count && marketing.orders_count ? (
        <span className={cn("hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline-flex sm:text-xs", chipClass)}>
          <Truck className="h-3 w-3 shrink-0" />
          {storefrontCopy.home.ordersDelivered(marketing.orders_count)}
        </span>
      ) : null}
    </div>
  );
}

export function StoreHero({ company, isLoading, showCta = false }: StoreHeroProps) {
  const marketing = getStorefrontMarketing(company);
  const deliveryMinutes = getEstimatedDeliveryMinutes(company);
  const hasCover = Boolean(company?.cover_url);
  const slogan = marketing.slogan ?? company?.description;

  if (isLoading) {
    return <Skeleton className="h-[4.5rem] w-full rounded-2xl sm:h-24" />;
  }

  const identity = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {company?.logo_url ? (
        <img
          src={company.logo_url}
          alt=""
          className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-white/25 sm:h-11 sm:w-11"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 sm:h-11 sm:w-11">
          <Store className="h-5 w-5" />
        </span>
      )}

      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
          {company?.trade_name ?? "Cardápio digital"}
        </h1>
        {slogan ? (
          <p className="truncate text-xs opacity-90 sm:text-sm">{slogan}</p>
        ) : null}
        <StoreMetaChips
          company={company}
          marketing={marketing}
          deliveryMinutes={deliveryMinutes}
          inverted
        />
      </div>
    </div>
  );

  if (hasCover) {
    return (
      <section className="relative h-20 overflow-hidden rounded-2xl shadow-md sm:h-28">
        <img src={company!.cover_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div className="relative flex h-full items-center gap-2 px-3 text-white sm:px-5">
          {identity}
          {showCta ? (
            <Link to="/cardapio" className="shrink-0">
              <Button size="sm" className="hidden gap-1 bg-white text-brand hover:bg-white/90 sm:inline-flex">
                {storefrontCopy.home.heroCta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : null}
          {marketing.promo_label && marketing.promo_url ? (
            <Link to={marketing.promo_url} className="shrink-0 sm:ml-1">
              <Button
                size="sm"
                variant="outline"
                className="hidden gap-1 border-white/40 bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              >
                <Tag className="h-3.5 w-3.5" />
                {marketing.promo_label}
              </Button>
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="gradient-hero relative overflow-hidden rounded-2xl px-3 py-3 text-[hsl(var(--primary-foreground))] shadow-md sm:px-5 sm:py-4">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-2">
        {identity}
        {showCta ? (
          <Link to="/cardapio" className="shrink-0">
            <Button size="sm" className="hidden gap-1 bg-white text-brand hover:bg-white/90 sm:inline-flex">
              {storefrontCopy.home.heroCta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : null}
        {marketing.promo_label && marketing.promo_url ? (
          <Link to={marketing.promo_url} className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="hidden gap-1 border-white/40 bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
            >
              <Tag className="h-3.5 w-3.5" />
              {marketing.promo_label}
            </Button>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
