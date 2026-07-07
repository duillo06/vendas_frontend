import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { OptionGroupSelector } from "./OptionGroupSelector";
import type { ProductDetail } from "../types/catalog.types";
import {
  calculateItemPrice,
  getSelectedOptions,
  validateOptionSelections,
} from "../utils/priceCalculator";

import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

type ProductDetailViewProps = {
  product: ProductDetail;
};

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const selectedOptions = useMemo(
    () => getSelectedOptions(product, selections),
    [product, selections],
  );

  const totalPrice = useMemo(
    () => calculateItemPrice(product.base_price, selectedOptions),
    [product.base_price, selectedOptions],
  );

  const primaryImage = product.images.find((img) => img.is_primary) ?? product.images[0];

  const handleAddToCart = () => {
    const error = validateOptionSelections(product.option_groups, selections);
    if (error) {
      toast.error(error);
      return;
    }

    toast.info("Carrinho entra na Sprint 6", {
      description: `${product.name} — ${totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    });
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
            className="flex-1"
            disabled={!product.is_available}
            onClick={handleAddToCart}
          >
            Adicionar ao carrinho
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
