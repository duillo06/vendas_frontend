import {
  Heart,
  Lock,
  Search,
  Share2,
  ShoppingCart,
  Star,
  Store,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import {
  getEstimatedDeliveryMinutes,
  getStorefrontMarketing,
} from "@/features/company/utils/storefrontTheme";
import type { CompanyPublic } from "@/features/company/types/company.types";
import {
  buildShopMetaLine,
  deliveryWindowLabel,
  getNextOpenLabel,
} from "@/features/storefront/utils/shopHours";
import { useCart } from "@/features/cart";
import { formatCurrency } from "@/shared/lib/format";
import { resolveMediaUrl } from "@/shared/lib/media";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type StoreHeroProps = {
  company?: CompanyPublic | null;
  isLoading?: boolean;
  compact?: boolean;
  onSearchClick?: () => void;
};

function GlassIconButton({
  label,
  onClick,
  to,
  children,
}: {
  label: string;
  onClick?: () => void;
  to?: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white shadow-[var(--shadow-sm)] backdrop-blur-md transition active:scale-95 hover:bg-black/35";

  if (to) {
    return (
      <Link to={to} aria-label={label} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

function storeFavKey(slug: string) {
  return `foodflow_store_fav_${slug}`;
}

export function StoreHero({ company, isLoading, compact = false, onSearchClick }: StoreHeroProps) {
  const marketing = getStorefrontMarketing(company);
  const deliveryMinutes = getEstimatedDeliveryMinutes(company);
  const { totalItems } = useCart();
  const isOpen = Boolean(company?.is_open);
  const slug = company?.slug ?? "loja";

  const [fav, setFav] = useState(() => {
    try {
      return localStorage.getItem(storeFavKey(slug)) === "1";
    } catch {
      return false;
    }
  });

  const metaLine = useMemo(() => {
    const time = deliveryWindowLabel(deliveryMinutes);
    const mode = company?.settings.accepts_delivery
      ? "Entrega"
      : company?.settings.accepts_pickup
        ? "Retirada"
        : undefined;
    const min = company?.settings.min_order_value
      ? `Mín. ${formatCurrency(company.settings.min_order_value)}`
      : undefined;
    const fee =
      company?.settings.accepts_delivery && company.settings.delivery_fee != null
        ? Number(company.settings.delivery_fee) === 0
          ? "Frete grátis"
          : `Taxa ${formatCurrency(company.settings.delivery_fee)}`
        : undefined;
    const rating =
      marketing.show_rating && marketing.rating
        ? `★ ${marketing.rating.toFixed(1)}`
        : undefined;

    return buildShopMetaLine({ rating, time: time ?? undefined, mode, minOrder: min, fee });
  }, [company, deliveryMinutes, marketing]);

  const nextOpen = !isOpen ? getNextOpenLabel(company) : null;

  async function handleShare() {
    const url = window.location.origin + "/";
    const title = company?.trade_name ?? "Cardápio";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    } catch {
      /* cancelou share */
    }
  }

  function toggleStoreFav() {
    const next = !fav;
    setFav(next);
    try {
      localStorage.setItem(storeFavKey(slug), next ? "1" : "0");
    } catch {
      /* ignore */
    }
    toast.success(next ? "Loja salva nos favoritos" : "Removido dos favoritos");
  }

  if (isLoading) {
    return (
      <div className={cn(!compact && "-mx-4")}>
        <Skeleton className={cn("w-full rounded-none", compact ? "h-36" : "h-[240px]")} />
        <div className="space-y-2 px-4 pt-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <section className="overflow-hidden rounded-2xl">
        <div className="relative h-28 overflow-hidden sm:h-32">
          <HeroBackdrop coverUrl={company?.cover_url} closed={!isOpen} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-3">
            <StoreLogo url={company?.logo_url} size="sm" />
            <div className="min-w-0 pb-0.5 text-white">
              <h1 className="truncate text-base font-bold">{company?.trade_name}</h1>
              <p className="truncate text-[11px] text-white/80">{metaLine}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="-mx-4">
      {/* banner vitrine — ~240–260px */}
      <div className="relative h-[240px] overflow-hidden sm:h-[260px]">
        <HeroBackdrop coverUrl={company?.cover_url} closed={!isOpen} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/55" />

        {/* ações glass */}
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          <GlassIconButton label={fav ? "Remover favorito" : "Favoritar"} onClick={toggleStoreFav}>
            <Heart className={cn("h-4 w-4", fav && "fill-white")} />
          </GlassIconButton>
          <GlassIconButton label="Compartilhar" onClick={() => void handleShare()}>
            <Share2 className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton label="Buscar" onClick={onSearchClick}>
            <Search className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton label="Carrinho" to="/carrinho">
            <span className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 ? (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-0.5 text-[9px] font-bold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              ) : null}
            </span>
          </GlassIconButton>
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
      <div className="relative z-10 -mt-11 px-4 pb-1">
        <StoreLogo url={company?.logo_url} size="lg" />

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-[1.7rem]">
          {company?.trade_name ?? "Cardápio digital"}
        </h1>

        {metaLine ? (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1 text-sm text-[hsl(var(--muted-foreground))]">
            {marketing.show_rating && marketing.rating ? (
              <Star className="mr-0.5 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ) : null}
            {metaLine}
          </p>
        ) : null}
      </div>
    </section>
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
    <div
      className={cn("absolute inset-0", closed && "grayscale")}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.55)] via-[hsl(220_18%_22%)] to-[hsl(var(--accent)/0.45)]" />
      <div className="absolute -top-8 -right-10 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute bottom-0 left-6 h-36 w-36 rounded-full bg-[hsl(var(--primary)/0.35)] blur-3xl" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_20%_30%,white_0,transparent_45%),radial-gradient(circle_at_80%_70%,white_0,transparent_40%)]" />
    </div>
  );
}

function StoreLogo({ url, size }: { url?: string | null; size: "sm" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" : "h-12 w-12";
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
