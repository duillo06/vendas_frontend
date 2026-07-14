import {
  Clock,
  MapPin,
  Star,
  Store,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import {
  getEstimatedDeliveryMinutes,
  getStorefrontMarketing,
} from "@/features/company/utils/storefrontTheme";
import type { CompanyPublic } from "@/features/company/types/company.types";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type StoreHeroProps = {
  company?: CompanyPublic | null;
  isLoading?: boolean;
  /** versão enxuta pro cardápio (menos slogan / cover) */
  compact?: boolean;
};

function MetaChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-white px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))] sm:text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}

function StoreMetaChips({
  company,
  marketing,
  deliveryMinutes,
}: {
  company?: CompanyPublic | null;
  marketing: ReturnType<typeof getStorefrontMarketing>;
  deliveryMinutes: number | null;
}) {
  const acceptsDelivery = company?.settings.accepts_delivery;
  const acceptsPickup = company?.settings.accepts_pickup;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <MetaChip
        className={
          company?.is_open
            ? "border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))] text-brand"
            : "border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent-soft))] text-brand-accent"
        }
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            company?.is_open ? "bg-brand" : "bg-[hsl(var(--accent))]",
          )}
        />
        {company?.is_open ? "Aberto" : "Fechado"}
      </MetaChip>

      {deliveryMinutes ? (
        <MetaChip>
          <Clock className="h-3 w-3 shrink-0 text-brand" />
          <span className="sm:hidden">~{deliveryMinutes} min</span>
          <span className="hidden sm:inline">{storefrontCopy.home.deliveryEstimate(deliveryMinutes)}</span>
        </MetaChip>
      ) : null}

      {marketing.show_rating && marketing.rating ? (
        <MetaChip>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="sm:hidden">{marketing.rating.toFixed(1)}</span>
          <span className="hidden sm:inline">{storefrontCopy.home.rating(marketing.rating)}</span>
        </MetaChip>
      ) : null}

      {acceptsDelivery ? (
        <MetaChip className="hidden sm:inline-flex">
          <Truck className="h-3 w-3 shrink-0 text-brand" />
          Delivery
        </MetaChip>
      ) : null}

      {acceptsPickup ? (
        <MetaChip className="hidden sm:inline-flex">
          <MapPin className="h-3 w-3 shrink-0 text-brand" />
          Retirada
        </MetaChip>
      ) : null}

      {marketing.show_orders_count && marketing.orders_count ? (
        <MetaChip className="hidden md:inline-flex">
          <Users className="h-3 w-3 shrink-0 text-brand" />
          {storefrontCopy.home.ordersDelivered(marketing.orders_count)}
        </MetaChip>
      ) : null}
    </div>
  );
}

export function StoreHero({ company, isLoading, compact = false }: StoreHeroProps) {
  const marketing = getStorefrontMarketing(company);
  const deliveryMinutes = getEstimatedDeliveryMinutes(company);
  const hasCover = Boolean(company?.cover_url) && !compact;
  const slogan = marketing.slogan ?? company?.description;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white sm:rounded-2xl">
        <div className="flex items-center gap-3 p-3 sm:p-4">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl sm:h-14 sm:w-14" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36 sm:w-40" />
            <Skeleton className="h-4 w-48 max-w-full sm:w-56" />
            <Skeleton className="h-5 w-52 max-w-full sm:w-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-sm)] sm:rounded-2xl",
        compact && "rounded-xl",
      )}
    >
      {/* cover só como atmosfera — nunca fill de marca */}
      {hasCover ? (
        <div className="relative h-9 overflow-hidden sm:h-12">
          <img
            src={company!.cover_url!}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>
      ) : null}

      <div className={cn("relative flex gap-2.5 p-3 sm:gap-4 sm:p-4", !hasCover && "pt-3")}>
        <div className="identity-accent-rail shrink-0" aria-hidden />

        <div className="logo-halo shrink-0 self-start">
          {company?.logo_url ? (
            <div className="logo-frame h-11 w-11 sm:h-14 sm:w-14">
              <img src={company.logo_url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="logo-frame h-11 w-11 text-brand sm:h-14 sm:w-14">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="truncate text-base font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-xl">
              {company?.trade_name ?? "Cardápio digital"}
            </h1>

            {marketing.promo_label && marketing.promo_url ? (
              <Link
                to={marketing.promo_url}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))] px-2.5 py-0.5 text-[11px] font-medium text-brand transition hover:border-[hsl(var(--primary)/0.4)]"
              >
                <Tag className="h-3 w-3" />
                {marketing.promo_label}
              </Link>
            ) : null}
          </div>

          {slogan && !compact ? (
            <p className="line-clamp-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">{slogan}</p>
          ) : null}

          <StoreMetaChips
            company={company}
            marketing={marketing}
            deliveryMinutes={deliveryMinutes}
          />
        </div>
      </div>

      <div className="px-3 sm:px-4">
        <div className="identity-accent-bar" aria-hidden />
      </div>
    </section>
  );
}
