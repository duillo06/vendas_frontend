import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Clock, Flame, Heart } from "lucide-react";
import { toast } from "sonner";

import { useFavorites } from "@/features/favorites";
import {
  ProductBuilder,
  scrollToOptionGroup,
  validateAllGroups,
  calculateProductPrice,
  flattenSelectionsForCart,
  buildInitialSelections,
  pruneHiddenSelections,
  type ProductBuilderState,
} from "@/features/product-builder";
import { ProductFeatureChips } from "@/features/storefront/components/ProductFeatureChips";
import {
  getProductBadges,
  getProductFeatureChips,
} from "@/features/storefront/utils/productBadges";
import { ProductImageCarousel } from "./ProductImageCarousel";
import { CompositionPicker, composedBasePrice } from "./CompositionPicker";
import {
  ProductOrderSummary,
  type OrderSummaryLine,
} from "./ProductOrderSummary";
import { ProductPurchaseBar } from "./ProductPurchaseBar";
import { ProductSuggestionRail } from "./ProductSuggestionRail";
import type { ProductDetail, ProductListItem } from "../types/catalog.types";
import type { CartComponent } from "@/features/cart/types/cart.types";

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
  quantity?: number;
  selectedOptions: Array<{
    optionId: string;
    optionGroupId: string;
    optionGroupName: string;
    name: string;
    priceModifier: number;
    priceType: "fixed" | "percentage";
    quantity: number;
  }>;
  components?: CartComponent[];
};

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts?: ProductListItem[];
  categoryName?: string;
  onAddToCart?: (payload: ProductAddToCartPayload) => void;
};

export function ProductDetailView({
  product,
  relatedProducts = [],
  categoryName,
  onAddToCart,
}: ProductDetailViewProps) {
  const [selections, setSelections] = useState<ProductBuilderState>(() =>
    buildInitialSelections(product.option_groups),
  );
  const [invalidGroupId, setInvalidGroupId] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [priceBump, setPriceBump] = useState(false);
  const [compositionParts, setCompositionParts] = useState<CartComponent[]>([]);
  const [quantity, setQuantity] = useState(1);
  const isFirstPriceRender = useRef(true);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    setSelections(buildInitialSelections(product.option_groups));
    setCompositionParts([]);
    setQuantity(1);
    setInvalidGroupId(null);
    setAddedToCart(false);
  }, [product.id]);

  const unitPrice = useMemo(() => {
    const withOptions = calculateProductPrice(product, selections);
    if (!product.composition?.enabled || compositionParts.length === 0) {
      return withOptions;
    }
    // troca o preço base pelo da composição, mantendo o que as opções somam
    const optionsDelta = withOptions - product.base_price;
    return Math.round((composedBasePrice(product, compositionParts) + optionsDelta) * 100) / 100;
  }, [product, selections, compositionParts]);

  useEffect(() => {
    if (isFirstPriceRender.current) {
      isFirstPriceRender.current = false;
      return;
    }
    setPriceBump(true);
    const timer = window.setTimeout(() => setPriceBump(false), 350);
    return () => window.clearTimeout(timer);
  }, [unitPrice, quantity]);

  const summaryLines = useMemo((): OrderSummaryLine[] => {
    const lines: OrderSummaryLine[] = [];

    for (const part of compositionParts) {
      lines.push({ id: `comp-${part.productId}`, label: part.productName });
    }

    for (const opt of flattenSelectionsForCart(product, selections)) {
      lines.push({
        id: `${opt.optionGroupId}-${opt.optionId}`,
        label: opt.quantity > 1 ? `${opt.quantity}× ${opt.name}` : opt.name,
        detail: opt.optionGroupName,
      });
    }

    return lines;
  }, [product, selections, compositionParts]);

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];
  const isPopular = product.tags.some((tag) =>
    ["destaque", "popular", "favorito", "mais vendido"].includes(tag.toLowerCase()),
  );
  const hasPromotion =
    product.compare_price !== null && product.compare_price > product.base_price;
  const badges = getProductBadges(product.tags, { hasPromotion });
  const featureChips = getProductFeatureChips(product.tags);
  const favorite = isFavorite(product.id);
  const hasCustomization =
    (product.composition?.enabled ?? false) || product.option_groups.length > 0;
  const personalizeEmoji = /pizza/i.test(`${product.name} ${categoryName ?? ""}`)
    ? "🍕"
    : /pastel/i.test(`${product.name} ${categoryName ?? ""}`)
      ? "🥟"
      : /a[cç]a[ií]/i.test(`${product.name} ${categoryName ?? ""}`)
        ? "🫐"
        : storefrontCopy.product.personalizeEmoji;

  const handleAddToCart = () => {
    const validation = validateAllGroups(product.option_groups, selections);
    if (validation) {
      setInvalidGroupId(validation.groupId);
      toast.error(validation.message);
      scrollToOptionGroup(validation.groupId);
      return;
    }

    if (product.composition?.enabled) {
      const minAdditional = Math.max(0, product.composition.min_parts - 1);
      if (compositionParts.length < minAdditional) {
        toast.error(`Escolha ${minAdditional} sabor(es) para combinar.`);
        return;
      }
    }

    setInvalidGroupId(null);
    if (!onAddToCart) return;

    const optionsPayload = flattenSelectionsForCart(product, selections).map((opt) => ({
      optionId: opt.optionId,
      optionGroupId: opt.optionGroupId,
      optionGroupName: opt.optionGroupName,
      name: opt.name,
      priceModifier: opt.priceModifier,
      priceType: opt.priceType,
      quantity: opt.quantity,
    }));

    onAddToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: primaryImage?.image_url ?? null,
      basePrice: product.base_price,
      unitPrice,
      quantity,
      selectedOptions: optionsPayload,
      components: compositionParts.length > 0 ? compositionParts : undefined,
    });

    setAddedToCart(true);
  };

  const handleContinueShopping = () => {
    setAddedToCart(false);
    if (relatedProducts.length > 0 && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate("/cardapio");
  };

  return (
    <div className="pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(7rem+env(safe-area-inset-bottom,0px))]">
      {/* protagonista: foto + identidade do produto */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <ProductImageCarousel images={product.images} productName={product.name} />

        <div className="space-y-5">
          <div className="space-y-3">
            {badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <Badge key={badge.label} className="border-0 bg-brand-soft text-brand">
                    {badge.label}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {product.name}
              </h1>
              <button
                type="button"
                aria-label={favorite ? "Remover dos favoritos" : "Favoritar"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-white shadow-sm transition hover:scale-105"
                onClick={() => {
                  toggle(product.id);
                  toast.success(
                    favorite
                      ? storefrontCopy.product.favoriteRemoved
                      : storefrontCopy.product.favoriteSaved,
                  );
                }}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    favorite ? "fill-red-500 text-red-500" : "text-slate-500",
                  )}
                />
              </button>
            </div>

            {product.description ? (
              <p className="max-w-prose text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
                {product.description}
              </p>
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
              {isPopular
                ? storefrontCopy.product.favorite
                : storefrontCopy.product.customizeHint}
            </UiHint>
          ) : (
            <UiHint tone="neutral">{storefrontCopy.product.unavailable}</UiHint>
          )}

          <ProductFeatureChips items={featureChips} title={storefrontCopy.product.highlightsTitle} />

          {/* preço de referência — o total vivo fica na barra fixa */}
          <div className="flex items-baseline gap-3">
            <PriceDisplay
              value={unitPrice}
              className={cn(
                "text-3xl font-bold text-brand transition-transform",
                priceBump && "animate-price-pop",
              )}
            />
            {unitPrice !== product.base_price ? (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                <PriceDisplay value={product.base_price} />
              </span>
            ) : product.compare_price ? (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                <PriceDisplay value={product.compare_price} />
              </span>
            ) : null}
          </div>

          <Link to="/cardapio" className="hidden sm:inline-flex">
            <Button type="button" variant="ghost" size="sm" className="px-0 text-brand">
              ← Voltar ao cardápio
            </Button>
          </Link>
        </div>
      </div>

      {/* personalização — continuação do produto, não um bloco rival */}
      {hasCustomization ? (
        <section className="mt-12 space-y-6 border-t border-[hsl(var(--border))]/80 pt-10 sm:mt-16 sm:pt-12">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              <span aria-hidden className="mr-1.5">
                {personalizeEmoji}
              </span>
              {storefrontCopy.product.personalizeTitle}
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {storefrontCopy.product.personalizeSubtitle}
            </p>
          </div>

          {product.composition?.enabled ? (
            <CompositionPicker
              product={product}
              selected={compositionParts}
              onChange={(parts) => {
                setCompositionParts(parts);
                setAddedToCart(false);
              }}
            />
          ) : null}

          <ProductBuilder
            groups={product.option_groups}
            selections={selections}
            basePrice={product.base_price}
            invalidGroupId={invalidGroupId}
            onChange={(groupId, items) => {
              setInvalidGroupId((current) => (current === groupId ? null : current));
              setAddedToCart(false);
              setSelections((prev) =>
                pruneHiddenSelections(product.option_groups, { ...prev, [groupId]: items }),
              );
            }}
          />

          <ProductOrderSummary
            productName={product.name}
            lines={summaryLines}
            total={unitPrice}
          />
        </section>
      ) : null}

      {/* sugestões — apoio visual, nunca protagonista */}
      {relatedProducts.length > 0 ? (
        <div
          ref={suggestionsRef}
          className="mt-14 scroll-mt-24 border-t border-[hsl(var(--border))]/60 pt-10 sm:mt-16 sm:pt-12"
        >
          <ProductSuggestionRail
            products={relatedProducts}
            currentProductName={product.name}
            currentCategoryName={categoryName}
          />
        </div>
      ) : null}

      <ProductPurchaseBar
        unitPrice={unitPrice}
        quantity={quantity}
        onQuantityChange={(next) => {
          setQuantity(next);
          setAddedToCart(false);
        }}
        onAdd={handleAddToCart}
        onContinueShopping={handleContinueShopping}
        disabled={!product.is_available || !onAddToCart}
        addedToCart={addedToCart}
        priceBump={priceBump}
      />
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
