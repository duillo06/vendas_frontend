import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, Clock, Flame, Heart } from "lucide-react";
import { toast } from "sonner";

import { useFavorites } from "@/features/favorites";
import { ProductFeatureChips } from "@/features/storefront/components/ProductFeatureChips";
import {
  getProductBadges,
  getProductFeatureChips,
} from "@/features/storefront/utils/productBadges";
import { OptionGroupSelector } from "./OptionGroupSelector";
import { ProductImageCarousel } from "./ProductImageCarousel";
import type { ProductDetail, ProductListItem } from "../types/catalog.types";
import {
  calculateItemPrice,
  getSelectedOptions,
  validateOptionSelections,
} from "../utils/priceCalculator";

import { ProductCard } from "@/shared/components/ProductCard";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";
import { cn } from "@/shared/lib/utils";

export type ProductAddToCartPayload = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  basePrice: number;
  unitPrice: number;
  selectedOptions: Array<{
    optionId: string;
    optionGroupId: string;
    optionGroupName: string;
    name: string;
    priceModifier: number;
    priceType: "fixed" | "percentage";
  }>;
};

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts?: ProductListItem[];
  onAddToCart?: (payload: ProductAddToCartPayload) => void;
};

export function ProductDetailView({ product, relatedProducts = [], onAddToCart }: ProductDetailViewProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);
  const { isFavorite, toggle } = useFavorites();

  const selectedOptions = useMemo(
    () => getSelectedOptions(product, selections),
    [product, selections],
  );

  const totalPrice = useMemo(
    () => calculateItemPrice(product.base_price, selectedOptions),
    [product.base_price, selectedOptions],
  );

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const isPopular = product.tags.some((tag) =>
    ["destaque", "popular", "favorito", "mais vendido"].includes(tag.toLowerCase()),
  );
  const hasPromotion =
    product.compare_price !== null && product.compare_price > product.base_price;
  const badges = getProductBadges(product.tags, { hasPromotion });
  const featureChips = getProductFeatureChips(product.tags);
  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    const error = validateOptionSelections(product.option_groups, selections);
    if (error) {
      toast.error(error);
      return;
    }

    if (!onAddToCart) return;

    const optionsPayload: ProductAddToCartPayload["selectedOptions"] = [];
    for (const group of product.option_groups) {
      const chosen = selections[group.id] ?? [];
      for (const optionId of chosen) {
        const option = group.options.find((o) => o.id === optionId);
        if (!option) continue;
        optionsPayload.push({
          optionId: option.id,
          optionGroupId: group.id,
          optionGroupName: group.name,
          name: option.name,
          priceModifier: option.price_modifier,
          priceType: option.price_type,
        });
      }
    }

    onAddToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: primaryImage?.image_url ?? null,
      basePrice: product.base_price,
      unitPrice: totalPrice,
      selectedOptions: optionsPayload,
    });

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 500);
  };

  return (
    <div className="space-y-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageCarousel images={product.images} productName={product.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge.label} className="border-0 bg-brand-soft text-brand">
                  {badge.label}
                </Badge>
              ))}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
              <button
                type="button"
                aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-soft bg-white shadow-sm transition hover:scale-105"
                onClick={() => {
                  toggle(product.id);
                  toast.success(
                    favorite ? storefrontCopy.product.favoriteRemoved : storefrontCopy.product.favoriteSaved,
                  );
                }}
              >
                <Heart className={cn("h-5 w-5", favorite ? "fill-red-500 text-red-500" : "text-slate-500")} />
              </button>
            </div>
            {product.description ? (
              <p className="text-base leading-relaxed text-[hsl(var(--muted-foreground))]">{product.description}</p>
            ) : null}
            {!product.is_available ? <Badge variant="outline">Indisponível</Badge> : null}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            {product.prep_time ? (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-brand" />
                {storefrontCopy.product.prepTime(product.prep_time)}
              </span>
            ) : null}
            {isPopular ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-brand-accent">
                <Flame className="h-4 w-4" />
                Popular na casa
              </span>
            ) : null}
          </div>

          {product.is_available ? (
            <UiHint icon={isPopular ? Flame : Heart} tone="warm">
              {isPopular ? storefrontCopy.product.favorite : "Monte do seu jeito — cada detalhe conta."}
            </UiHint>
          ) : (
            <UiHint tone="neutral">{storefrontCopy.product.unavailable}</UiHint>
          )}

          <ProductFeatureChips items={featureChips} title={storefrontCopy.product.highlightsTitle} />

          <div className="flex items-baseline gap-3 rounded-2xl border border-brand-soft bg-brand-soft/40 px-4 py-3">
            <PriceDisplay value={totalPrice} className="text-3xl font-bold text-brand" />
            {totalPrice !== product.base_price ? (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                <PriceDisplay value={product.base_price} />
              </span>
            ) : product.compare_price ? (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                <PriceDisplay value={product.compare_price} />
              </span>
            ) : null}
          </div>

          <OptionGroupSelector
            groups={product.option_groups}
            selections={selections}
            onChange={(groupId, optionIds) =>
              setSelections((prev) => ({ ...prev, [groupId]: optionIds }))
            }
            basePrice={product.base_price}
          />

          <div className="space-y-3 max-lg:sticky max-lg:bottom-4 max-lg:z-10 max-lg:rounded-2xl max-lg:border max-lg:border-brand-soft max-lg:bg-white/95 max-lg:p-3 max-lg:pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] max-lg:shadow-lg max-lg:backdrop-blur-md">
            <Button
              type="button"
              size="lg"
              className={cn("h-12 w-full text-base font-semibold", justAdded && "animate-cart-bump")}
              disabled={!product.is_available || !onAddToCart}
              onClick={handleAddToCart}
            >
              {justAdded ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  {storefrontCopy.product.added}
                </span>
              ) : (
                storefrontCopy.product.addToCart
              )}
            </Button>
            <Link to="/cardapio" className="hidden sm:block">
              <Button type="button" variant="outline" size="lg" className="h-12 w-full">
                Voltar ao cardápio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="space-y-4 border-t border-[hsl(var(--border))] pt-10">
          <h2 className="text-xl font-bold">{storefrontCopy.product.relatedTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                slug={item.slug}
                name={item.name}
                description={item.description ?? undefined}
                price={item.base_price}
                comparePrice={item.compare_price}
                imageUrl={item.image_url}
                tags={item.tags}
                unavailable={!item.is_available}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
