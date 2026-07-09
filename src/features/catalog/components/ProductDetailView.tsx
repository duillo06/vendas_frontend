import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Check, Flame, Heart } from "lucide-react";
import { toast } from "sonner";

import { OptionGroupSelector } from "./OptionGroupSelector";
import type { ProductDetail } from "../types/catalog.types";
import {
  calculateItemPrice,
  getSelectedOptions,
  validateOptionSelections,
} from "../utils/priceCalculator";

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
  onAddToCart?: (payload: ProductAddToCartPayload) => void;
};

export function ProductDetailView({ product, onAddToCart }: ProductDetailViewProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);

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
    ["destaque", "popular", "favorito"].includes(tag.toLowerCase()),
  );

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
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-[hsl(var(--muted))]">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={primaryImage.alt_text || product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
            Sem imagem
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.description ? (
            <p className="text-[hsl(var(--muted-foreground))]">{product.description}</p>
          ) : null}
          {!product.is_available ? <Badge variant="outline">Indisponível</Badge> : null}
        </div>

        {product.is_available ? (
          <UiHint icon={isPopular ? Flame : Heart} tone="warm">
            {isPopular ? storefrontCopy.product.favorite : "Monte do seu jeito e adicione ao carrinho."}
          </UiHint>
        ) : (
          <UiHint tone="neutral">{storefrontCopy.product.unavailable}</UiHint>
        )}

        <div className="flex items-baseline gap-3">
          <PriceDisplay value={totalPrice} className="text-2xl font-bold text-[hsl(var(--primary))]" />
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className={cn("flex-1 transition-transform", justAdded && "animate-cart-bump")}
            disabled={!product.is_available || !onAddToCart}
            onClick={handleAddToCart}
          >
            {justAdded ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-5 w-5" />
                Adicionado!
              </span>
            ) : (
              "Adicionar ao carrinho"
            )}
          </Button>
          <Link to="/cardapio">
            <Button type="button" variant="outline" size="lg">
              Voltar ao cardápio
            </Button>
          </Link>
        </div>
      </div>
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
