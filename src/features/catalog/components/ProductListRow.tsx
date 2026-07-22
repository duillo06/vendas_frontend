import { Link } from "react-router";

import { useFavorites } from "@/features/favorites";
import {
  getProductBadges,
  type ProductBadgeTone,
} from "@/features/storefront/utils/productBadges";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

const badgeToneClass: Record<ProductBadgeTone, string> = {
  brand: "text-brand",
  accent: "text-orange-700",
  hot: "text-orange-700",
  fresh: "text-emerald-700",
  sale: "text-rose-700",
  neutral: "text-[hsl(var(--muted-foreground))]",
};

type ProductListRowProps = {
  product: ProductListItem;
  staggerIndex?: number;
};

/** linha densa no formato cardápio: texto | foto (referência delivery) */
export function ProductListRow({ product, staggerIndex }: ProductListRowProps) {
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const hasPromotion =
    product.compare_price != null && Number(product.compare_price) > Number(product.base_price);
  const promoBadges = (product.promotion?.badges ?? []).slice(0, 2);
  const badges = (
    promoBadges.length
      ? promoBadges.map((label) => ({ label, tone: "sale" as const }))
      : getProductBadges(product.tags, {
          hasPromotion,
          isFavorite: favorite,
        })
  ).slice(0, 2);

  return (
    <Link
      to={`/produto/${product.slug}`}
      className={cn(
        "product-list-row group flex items-start gap-3 py-4 sm:gap-4",
        !product.is_available && "opacity-55",
      )}
      style={
        staggerIndex != null
          ? { animationDelay: `${Math.min(staggerIndex, 10) * 30}ms` }
          : undefined
      }
    >
      {/* esquerda: nome → descrição → preço */}
      <div className="min-w-0 flex-1 pr-1">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-[hsl(var(--foreground))] sm:text-base">
          {product.name}
        </h3>

        {product.description ? (
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[hsl(var(--muted-foreground))]">
            {product.description}
          </p>
        ) : null}

        {badges.length ? (
          <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-medium">
            {badges.map((badge) => (
              <span key={badge.label} className={badgeToneClass[badge.tone]}>
                {badge.label}
              </span>
            ))}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <PriceDisplay
            value={product.base_price}
            className="text-[15px] font-bold tabular-nums text-[hsl(var(--foreground))] sm:text-base"
          />
          {hasPromotion ? (
            <PriceDisplay
              value={product.compare_price!}
              className="text-xs text-[hsl(var(--muted-foreground))] line-through"
            />
          ) : null}
        </div>

        {!product.is_available ? (
          <p className="mt-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
            Indisponível
          </p>
        ) : null}
      </div>

      {/* direita: foto quadrada ~80px */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[hsl(var(--muted))] sm:h-[88px] sm:w-[88px]">
        {product.image_url ? (
          <img
            src={resolveMediaUrl(product.image_url)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-active:scale-[0.98] sm:group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-[hsl(var(--muted))]" aria-hidden />
        )}
      </div>
    </Link>
  );
}
