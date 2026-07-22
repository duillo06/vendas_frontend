import { Bike, Clock, Lock, MapPin, Search, Star, Store } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import {
  getEstimatedDeliveryMinutes,
  getStorefrontMarketing,
} from "@/features/company/utils/storefrontTheme";
import type { CompanyPublic } from "@/features/company/types/company.types";
import {
  deliveryWindowLabel,
  getNextOpenLabel,
} from "@/features/storefront/utils/shopHours";
import { formatCurrency } from "@/shared/lib/format";
import { resolveMediaUrl } from "@/shared/lib/media";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type StoreHeroProps = {
  company?: CompanyPublic | null;
  isLoading?: boolean;
  /** cardápio: hero mais baixo, com infos compactas da loja */
  compact?: boolean;
  onSearchClick?: () => void;
};

function GlassIconButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white shadow-[var(--shadow-sm)] backdrop-blur-md transition active:scale-95 hover:bg-black/35";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" aria-label={label} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function StoreHero({ company, isLoading, compact = false, onSearchClick }: StoreHeroProps) {
  const marketing = getStorefrontMarketing(company);
  const deliveryMinutes = getEstimatedDeliveryMinutes(company);
  const isOpen = Boolean(company?.is_open);
  const instagramUrl = marketing.instagram_url?.trim() || null;

  const nextOpen = !isOpen ? getNextOpenLabel(company) : null;

  const fulfillment = useMemo(() => {
    const parts: string[] = [];
    if (company?.settings.accepts_delivery) parts.push("Delivery");
    if (company?.settings.accepts_pickup) parts.push("Retirada");
    return parts.join(" · ");
  }, [company]);

  if (isLoading) {
    return (
      <div className={cn(compact ? "-mx-4" : "-mx-4")}>
        <Skeleton
          className={cn(
            "w-full",
            compact ? "h-32 rounded-b-2xl sm:h-36" : "h-[192px] rounded-b-2xl sm:h-[208px]",
          )}
        />
        <div className="space-y-2 px-4 pt-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
    );
  }

  // cardápio — banner protagonista, mais baixo que a home, com infos úteis
  if (compact) {
    return (
      <section className="-mx-4">
        <div className="relative h-[7.5rem] overflow-hidden rounded-b-2xl sm:h-36">
          <HeroBackdrop coverUrl={company?.cover_url} closed={!isOpen} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10" />

          <div className="absolute top-2.5 right-3 z-20 flex gap-2">
            {instagramUrl ? (
              <GlassIconButton label="Instagram" href={instagramUrl}>
                <InstagramIcon className="h-4 w-4" />
              </GlassIconButton>
            ) : null}
            {onSearchClick ? (
              <GlassIconButton label="Buscar" onClick={onSearchClick}>
                <Search className="h-4 w-4" />
              </GlassIconButton>
            ) : null}
          </div>

          {isOpen ? (
            <div className="absolute top-2.5 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-[var(--shadow-sm)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Aberto
            </div>
          ) : (
            <div className="absolute top-2.5 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              Fechado
            </div>
          )}
        </div>

        <div className="relative z-10 -mt-8 space-y-2.5 px-4 pb-1">
          <StoreLogo url={company?.logo_url} size="md" />

          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {company?.trade_name ?? "Cardápio digital"}
            </h1>
            {!isOpen && nextOpen ? (
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{nextOpen}</p>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-1.5">
            <ShopMetaChips
              company={company}
              marketing={marketing}
              deliveryMinutes={deliveryMinutes}
              fulfillment={fulfillment}
            />
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="-mx-4">
      {/* capa colada no header — cantos de baixo arredondados */}
      <div className="relative h-[192px] overflow-hidden rounded-b-2xl sm:h-[208px]">
        <HeroBackdrop coverUrl={company?.cover_url} closed={!isOpen} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/55" />

        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {instagramUrl ? (
            <GlassIconButton label="Instagram" href={instagramUrl}>
              <InstagramIcon className="h-4 w-4" />
            </GlassIconButton>
          ) : null}
          {onSearchClick ? (
            <GlassIconButton label="Buscar" onClick={onSearchClick}>
              <Search className="h-4 w-4" />
            </GlassIconButton>
          ) : null}
        </div>

        {isOpen ? (
          <div className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-2.5 py-1 text-xs font-semibold text-white shadow-[var(--shadow-sm)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Aberto agora
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-black/85 px-4 py-3 text-center text-white backdrop-blur-sm">
            <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold">
              <Lock className="h-4 w-4" />
              Fechado
            </p>
            {nextOpen ? <p className="mt-0.5 text-xs text-white/75">{nextOpen}</p> : null}
          </div>
        )}
      </div>

      {/* identidade sob o banner */}
      <div className="relative z-10 -mt-11 space-y-2.5 px-4 pb-1">
        <StoreLogo url={company?.logo_url} size="lg" />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-[1.7rem]">
            {company?.trade_name ?? "Cardápio digital"}
          </h1>
          {!isOpen && nextOpen ? (
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{nextOpen}</p>
          ) : null}
        </div>

        <ul className="flex flex-wrap gap-1.5">
          <ShopMetaChips
            company={company}
            marketing={marketing}
            deliveryMinutes={deliveryMinutes}
            fulfillment={fulfillment}
          />
        </ul>
      </div>
    </section>
  );
}

function ShopMetaChips({
  company,
  marketing,
  deliveryMinutes,
  fulfillment,
}: {
  company?: CompanyPublic | null;
  marketing: ReturnType<typeof getStorefrontMarketing>;
  deliveryMinutes: number | null;
  fulfillment: string;
}) {
  return (
    <>
      {marketing.show_rating && marketing.rating ? (
        <MetaChip>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {marketing.rating.toFixed(1)}
        </MetaChip>
      ) : null}
      {deliveryMinutes ? (
        <MetaChip>
          <Bike className="h-3 w-3 text-brand" />
          {deliveryWindowLabel(deliveryMinutes) ?? `${deliveryMinutes} min`}
        </MetaChip>
      ) : company?.settings.estimated_prep_time ? (
        <MetaChip>
          <Clock className="h-3 w-3 text-brand" />
          ~{company.settings.estimated_prep_time} min
        </MetaChip>
      ) : null}
      {company?.settings.min_order_value != null && Number(company.settings.min_order_value) > 0 ? (
        <MetaChip>Pedido mín. {formatCurrency(company.settings.min_order_value)}</MetaChip>
      ) : null}
      {company?.settings.accepts_delivery && company.settings.delivery_fee != null ? (
        <MetaChip>
          {Number(company.settings.delivery_fee) === 0
            ? "Frete grátis"
            : `Taxa ${formatCurrency(company.settings.delivery_fee)}`}
        </MetaChip>
      ) : null}
      {fulfillment ? (
        <MetaChip>
          <MapPin className="h-3 w-3 text-brand" />
          {fulfillment}
        </MetaChip>
      ) : null}
    </>
  );
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-white px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--foreground))]/85 shadow-[var(--shadow-xs)]">
      {children}
    </li>
  );
}

function HeroBackdrop({ coverUrl, closed }: { coverUrl?: string | null; closed: boolean }) {
  const src = resolveMediaUrl(coverUrl);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[filter] duration-300",
          closed && "grayscale",
        )}
      />
    );
  }

  return (
    <div className={cn("absolute inset-0", closed && "grayscale")} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.55)] via-[hsl(220_18%_22%)] to-[hsl(var(--accent)/0.45)]" />
      <div className="absolute -top-8 -right-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute bottom-0 left-6 h-36 w-36 rounded-full bg-[hsl(var(--primary)/0.35)] blur-3xl" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_20%_30%,white_0,transparent_45%),radial-gradient(circle_at_80%_70%,white_0,transparent_40%)]" />
    </div>
  );
}

function StoreLogo({ url, size }: { url?: string | null; size: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
      : size === "md"
        ? "h-14 w-14"
        : "h-12 w-12";
  const src = resolveMediaUrl(url);
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-white text-brand shadow-[var(--shadow-lg)]",
        box,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <Store className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
      )}
    </div>
  );
}
