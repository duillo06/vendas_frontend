import { Clock, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { useAddToCart, useCart } from "@/features/cart";
import { buildCartItemId } from "@/features/cart/utils/cartItemId";
import { useFavorites } from "@/features/favorites";
import {
  getProductBadges,
  type ProductBadgeTone,
} from "@/features/storefront/utils/productBadges";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";
import { resolveMediaUrl } from "@/shared/lib/media";
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
  hasOptions?: boolean;
  /** legado: se false, card gerencia qty sozinho pra item simples */
  onQuickAdd?: () => void;
  staggerIndex?: number;
  className?: string;
};

const badgeToneClass: Record<ProductBadgeTone, string> = {
  brand: "bg-brand/95 text-[hsl(var(--primary-foreground))] backdrop-blur-sm",
  accent: "badge-hot backdrop-blur-sm",
  hot: "badge-hot backdrop-blur-sm",
  fresh: "badge-fresh backdrop-blur-sm",
  sale: "badge-sale backdrop-blur-sm",
  neutral: "bg-black/55 text-white backdrop-blur-sm",
};

function savingsPercent(price: number, compare: number): number {
  if (compare <= 0 || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

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
  hasOptions = false,
  onQuickAdd,
  staggerIndex,
  className,
}: ProductCardProps) {
  const { isFavorite, toggle } = useFavorites();
  const addToCart = useAddToCart();
  const { items, updateQuantity, removeItem } = useCart();
  const [heartBump, setHeartBump] = useState(false);
  const favorite = isFavorite(id);

  const simpleCartId = buildCartItemId(id, []);
  const cartLine = items.find((item) => item.id === simpleCartId);
  const qty = cartLine?.quantity ?? 0;
  const canQuickQty = !unavailable && !hasOptions;

  const numericPrice = Number(price);
  const numericCompare =
    comparePrice !== null && comparePrice !== undefined ? Number(comparePrice) : null;
  const hasPromotion = numericCompare != null && numericCompare > numericPrice;
  const savePct = hasPromotion ? savingsPercent(numericPrice, numericCompare!) : 0;

  const badges = getProductBadges(tags, {
    hasPromotion,
    isFavorite: favorite,
    prepTime,
  });

  const handleFavorite = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(id);
    setHeartBump(true);
    window.setTimeout(() => setHeartBump(false), 350);
    toast.success(
      favorite ? storefrontCopy.product.favoriteRemoved : storefrontCopy.product.favoriteSaved,
    );
  };

  const addSimple = () => {
    if (onQuickAdd) {
      onQuickAdd();
      return;
    }
    addToCart({
      productId: id,
      productSlug: slug,
      productName: name,
      imageUrl: imageUrl ?? null,
      basePrice: numericPrice,
      unitPrice: numericPrice,
      selectedOptions: [],
    });
  };

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addSimple();
    toast.success(storefrontCopy.product.added);
  };

  const handleInc = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!cartLine) {
      addSimple();
      return;
    }
    updateQuantity(cartLine.id, cartLine.quantity + 1);
  };

  const handleDec = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!cartLine) return;
    if (cartLine.quantity <= 1) {
      removeItem(cartLine.id);
      return;
    }
    updateQuantity(cartLine.id, cartLine.quantity - 1);
  };

  return (
    <Link to={`/produto/${slug}`} className={cn("block", unavailable && "pointer-events-none", className)}>
      <article
        className={cn(
          "product-card-vitrine group h-full stagger-fade-up",
          unavailable && "opacity-70",
        )}
        style={
          staggerIndex != null
            ? { animationDelay: `${Math.min(staggerIndex, 8) * 40}ms` }
            : undefined
        }
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--muted))] sm:aspect-[5/4]">
          {imageUrl ? (
            <img
              src={resolveMediaUrl(imageUrl)}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--muted))] text-sm text-[hsl(var(--muted-foreground))]">
              Sem imagem
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute left-2.5 top-2.5 flex max-w-[75%] flex-wrap gap-1.5">
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
              "absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-[var(--shadow-sm)] transition duration-200 hover:scale-105 active:scale-95",
              heartBump && "animate-heart-pop",
            )}
            onClick={handleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                favorite ? "fill-red-500 text-red-500" : "text-slate-600",
              )}
            />
          </button>

          {canQuickQty ? (
            <div className="absolute right-2.5 bottom-2.5">
              {qty > 0 ? (
                <div
                  className="flex h-11 items-center gap-1 rounded-full bg-brand px-1.5 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] animate-fade-up"
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    type="button"
                    aria-label="Diminuir"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                    onClick={handleDec}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    aria-label="Aumentar"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 active:scale-95"
                    onClick={handleInc}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Adicionar ao carrinho"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] transition duration-200 hover:scale-105 active:scale-95"
                  onClick={handleAdd}
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-3.5 pt-3 pb-3.5 sm:px-4">
          <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand sm:text-base">
            {name}
          </h3>

          {description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              {description}
            </p>
          ) : null}

          {prepTime ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              <Clock className="h-3.5 w-3.5" />
              {storefrontCopy.product.prepTime(prepTime)}
            </span>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <PriceDisplay
                  value={price}
                  className="text-[1.35rem] font-bold tabular-nums tracking-tight text-brand sm:text-2xl"
                />
                {hasPromotion ? (
                  <PriceDisplay
                    value={comparePrice!}
                    className="text-xs text-[hsl(var(--muted-foreground))] line-through"
                  />
                ) : null}
              </div>
              {savePct >= 5 ? (
                <p className="text-[11px] font-semibold text-emerald-700">Economize {savePct}%</p>
              ) : null}
            </div>

            {unavailable ? (
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Indisponível</span>
            ) : hasOptions ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary-soft))] px-2.5 py-1 text-[11px] font-semibold text-brand">
                <ShoppingBag className="h-3.5 w-3.5" />
                Escolher
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
