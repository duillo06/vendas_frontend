import { Clock, Flame, Heart, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { useFavorites } from "@/features/favorites";
import {
  getProductBadges,
  type ProductBadgeTone,
} from "@/features/storefront/utils/productBadges";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

type ProductCardProps = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number | string;
  comparePrice?: number | null;
  imageUrl?: string | null;
  tags?: string[];
  prepTime?: number | null;
  unavailable?: boolean;
  onQuickAdd?: () => void;
  staggerIndex?: number;
  className?: string;
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  brand: "bg-brand text-[hsl(var(--primary-foreground))]",
  accent: "badge-hot",
  hot: "badge-hot",
  fresh: "badge-fresh",
  sale: "badge-sale",
  neutral: "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
};

export function ProductCard({
  id,
  slug,
  name,
  description,
  price,
  comparePrice,
  imageUrl,
  tags = [],
  prepTime,
  unavailable = false,
  onQuickAdd,
  staggerIndex,
  className,
}: ProductCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const [heartBump, setHeartBump] = useState(false);
  const favorite = isFavorite(id);

  const hasPromotion =
    comparePrice !== null &&
    comparePrice !== undefined &&
    Number(comparePrice) > Number(price);
  const badges = getProductBadges(tags, {
    hasPromotion,
    isFavorite: favorite,
    prepTime,
  });
  const isPopular = tags.some((tag) => /destaque|popular|mais vendido/i.test(tag));

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(id);
    setHeartBump(true);
    window.setTimeout(() => setHeartBump(false), 350);
    toast.success(favorite ? storefrontCopy.product.favoriteRemoved : storefrontCopy.product.favoriteSaved);
  };

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onQuickAdd?.();
    toast.success(storefrontCopy.product.added);
  };

  return (
    <Link to={`/produto/${slug}`} className={cn("block", unavailable && "pointer-events-none", className)}>
      <article
        className={cn(
          "product-card-premium group h-full stagger-fade-up",
          unavailable && "opacity-70",
        )}
        style={
          staggerIndex != null
            ? { animationDelay: `${Math.min(staggerIndex, 8) * 40}ms` }
            : undefined
        }
      >
        <div className="relative min-h-[11rem] flex-[3] overflow-hidden bg-[hsl(var(--muted))] sm:min-h-[12.5rem]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full min-h-[11rem] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
              Sem imagem
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          <div className="absolute left-2 top-2 flex max-w-[70%] flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-[var(--shadow-xs)]",
                  badgeToneClass[badge.tone],
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>

          <button
            type="button"
            aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
            className={cn(
              "absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--card))]/95 shadow-[var(--shadow-sm)] transition duration-200 hover:scale-105",
              heartBump && "animate-heart-pop",
            )}
            onClick={handleFavorite}
          >
            <Heart
              className={cn("h-4 w-4 transition-colors", favorite ? "fill-red-500 text-red-500" : "text-slate-600")}
            />
          </button>

          {!unavailable && onQuickAdd ? (
            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] opacity-100 shadow-[var(--shadow-md)] transition duration-200 active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={handleQuickAdd}
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-[1] flex-col gap-2 p-3.5 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 type-caption">
            {isPopular ? (
              <span className="inline-flex items-center gap-1 font-medium text-brand-accent">
                <Flame className="h-3.5 w-3.5" />
                Popular
              </span>
            ) : null}
            {prepTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {storefrontCopy.product.prepTime(prepTime)}
              </span>
            ) : null}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors duration-200 group-hover:text-brand">
            {name}
          </h3>

          {description ? (
            <p className="line-clamp-2 type-caption">{description}</p>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <PriceDisplay value={price} className="text-xl font-bold tabular-nums text-brand" />
              {hasPromotion ? (
                <PriceDisplay
                  value={comparePrice!}
                  className="text-xs text-[hsl(var(--muted-foreground))] line-through"
                />
              ) : null}
            </div>
            {!unavailable ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ShoppingBag className="h-3.5 w-3.5" />
                Ver
              </span>
            ) : (
              <span className="type-caption font-medium">Indisponível</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
