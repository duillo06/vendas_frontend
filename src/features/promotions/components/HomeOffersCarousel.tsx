import { Link } from "react-router";
import { Percent, Zap } from "lucide-react";

import type { PublicOffer } from "@/features/promotions";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { resolveMediaUrl } from "@/shared/lib/media";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type Props = {
  offers?: PublicOffer[];
  isLoading?: boolean;
};

function highlightLabel(weight: number): string | null {
  if (weight >= 200) return "Relâmpago";
  if (weight >= 100) return "Destaque";
  return null;
}

/** trilho de ofertas — mesmo tamanho de Lançamentos/Combos, com foco de promo */
export function HomeOffersCarousel({ offers, isLoading }: Props) {
  if (isLoading) {
    return (
      <section className="space-y-2.5 py-2">
        <Skeleton className="h-4 w-28" />
        <div className="-mx-1 flex gap-3 overflow-hidden px-1">
          <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl sm:w-[148px]" />
          <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl sm:w-[148px]" />
          <Skeleton className="aspect-square w-[132px] shrink-0 rounded-2xl sm:w-[148px]" />
        </div>
      </section>
    );
  }

  if (!offers?.length) return null;

  const sorted = [...offers].sort(
    (a, b) => (b.weight ?? 10) - (a.weight ?? 10) || a.promo_price - b.promo_price,
  );

  return (
    <section className="space-y-2.5 py-2">
      <div className="flex items-baseline justify-between gap-2 px-0.5">
        <div>
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-[hsl(var(--primary-foreground))]">
              <Percent className="h-3 w-3" strokeWidth={2.5} />
            </span>
            Promoções
          </h3>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            Ofertas pra aproveitar agora.
          </p>
        </div>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scroll-smooth [-webkit-overflow-scrolling:touch]">
        {sorted.map((offer, index) => {
          const label = highlightLabel(offer.weight ?? 10);
          const featured = index === 0 || (offer.weight ?? 10) >= 100;

          return (
            <Link
              key={`${offer.campaign_id}-${offer.product_id}`}
              to={`/produto/${offer.product_slug}`}
              className="group relative w-[132px] shrink-0 sm:w-[148px]"
            >
              <div
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl bg-[hsl(var(--muted))] shadow-[var(--shadow-xs)]",
                  featured
                    ? "ring-2 ring-[hsl(var(--primary)/0.45)]"
                    : "ring-1 ring-[hsl(var(--primary)/0.25)]",
                )}
              >
                {offer.image_url ? (
                  <img
                    src={resolveMediaUrl(offer.image_url)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[hsl(var(--primary)/0.25)] to-[hsl(var(--muted))]">
                    <Percent className="h-7 w-7 text-brand opacity-70" />
                  </div>
                )}

                {/* selo de % — foco sem ocupar a tela */}
                {offer.discount_percent > 0 ? (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-xs)]">
                    −{offer.discount_percent}%
                  </span>
                ) : null}

                {label ? (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
                    {(offer.weight ?? 10) >= 200 ? <Zap className="h-2.5 w-2.5" /> : null}
                    {label}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug">
                {offer.product_name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <PriceDisplay value={offer.promo_price} className="text-sm font-bold text-brand" />
                <span className="text-[10px] text-[hsl(var(--muted-foreground))] line-through">
                  {formatCurrency(offer.reference_price)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
