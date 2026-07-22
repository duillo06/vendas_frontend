import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Percent } from "lucide-react";

import { promotionsPublicApi } from "@/features/promotions";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { SectionHeading } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { resolveMediaUrl } from "@/shared/lib/media";
import { formatCurrency } from "@/shared/lib/format";

/** carrossel leve de ofertas — some sozinho se não houver campanha */
export function HomeOffersCarousel() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ["public", "promotion-offers"],
    queryFn: () => promotionsPublicApi.offers(),
  });

  if (isLoading) {
    return (
      <section className="space-y-3">
        <SectionHeading title="Promoções" icon={Percent} accent="chart-3" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="h-40 w-44 shrink-0 rounded-2xl" />
          <Skeleton className="h-40 w-44 shrink-0 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!offers?.length) return null;

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Promoções"
        description="Ofertas pra aproveitar agora."
        icon={Percent}
        accent="chart-3"
      />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {offers.map((offer) => (
          <article
            key={offer.campaign_id}
            className="w-[11.5rem] shrink-0 rounded-2xl border border-[hsl(var(--border))] bg-white p-3 shadow-[var(--shadow-xs)]"
          >
            <div className="h-24 w-full overflow-hidden rounded-xl bg-[hsl(var(--muted))]">
              {offer.image_url ? (
                <img
                  src={resolveMediaUrl(offer.image_url)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{offer.product_name}</p>
            <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] line-through">
              {formatCurrency(offer.reference_price)}
            </p>
            <PriceDisplay value={offer.promo_price} className="text-base font-bold text-brand" />
            {offer.save_amount > 0 ? (
              <p className="mt-0.5 text-[11px] font-medium text-brand">
                Economize {formatCurrency(offer.save_amount)}
              </p>
            ) : null}
            <Link to={`/produto/${offer.product_slug}`} className="mt-2 block">
              <Button type="button" size="sm" className="h-9 w-full bg-brand text-xs font-semibold">
                Ver oferta
              </Button>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
