import { Plus } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { useAddToCart } from "@/features/cart";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

type ProductRailProps = {
  title?: string;
  subtitle?: string;
  products: ProductListItem[];
};

export function ProductRail({ title, subtitle, products }: ProductRailProps) {
  const addToCart = useAddToCart();

  if (!products.length) return null;

  return (
    <section className="space-y-2.5 py-2">
      {title ? (
        <div className="px-0.5">
          <h3 className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scroll-smooth [-webkit-overflow-scrolling:touch]">
        {products.map((product) => {
          const canAdd = product.is_available && !product.has_options;
          return (
            <Link
              key={product.id}
              to={`/produto/${product.slug}`}
              className="product-rail-card group relative w-[132px] shrink-0 sm:w-[148px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[hsl(var(--muted))] shadow-[var(--shadow-xs)] ring-1 ring-[hsl(var(--border)/0.5)]">
                {product.image_url ? (
                  <img
                    src={resolveMediaUrl(product.image_url)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : null}
                {canAdd ? (
                  <button
                    type="button"
                    aria-label={`Adicionar ${product.name}`}
                    className="absolute right-1.5 bottom-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)] active:scale-95"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      addToCart({
                        productId: product.id,
                        productSlug: product.slug,
                        productName: product.name,
                        imageUrl: product.image_url,
                        basePrice: product.base_price,
                        unitPrice: product.base_price,
                        selectedOptions: [],
                      });
                      toast.success(storefrontCopy.product.added);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug">{product.name}</p>
              <PriceDisplay value={product.base_price} className="mt-0.5 text-sm font-bold text-brand" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

type ProductSpotlightProps = {
  product: ProductListItem;
  label: string;
};

/** card full-width que quebra a monotonia da lista */
export function ProductSpotlight({ product, label }: ProductSpotlightProps) {
  const addToCart = useAddToCart();
  const canAdd = product.is_available && !product.has_options;
  const hasPromotion =
    product.compare_price != null && Number(product.compare_price) > Number(product.base_price);

  return (
    <Link
      to={`/produto/${product.slug}`}
      className={cn(
        "product-spotlight group relative flex overflow-hidden rounded-2xl bg-[hsl(var(--card))] shadow-[var(--shadow-sm)] ring-1 ring-[hsl(var(--border)/0.7)]",
      )}
    >
      <div className="relative h-32 w-[42%] shrink-0 overflow-hidden sm:h-36 sm:w-[38%]">
        {product.image_url ? (
          <img
            src={resolveMediaUrl(product.image_url)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-[hsl(var(--muted))]" />
        )}
        <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-xs)]">
          {label}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">{product.name}</h3>
        {product.description ? (
          <p className="line-clamp-2 text-xs text-[hsl(var(--muted-foreground))]">{product.description}</p>
        ) : null}
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <PriceDisplay value={product.base_price} className="text-lg font-bold text-brand" />
            {hasPromotion ? (
              <PriceDisplay
                value={product.compare_price!}
                className="text-xs text-[hsl(var(--muted-foreground))] line-through"
              />
            ) : null}
          </div>
          {canAdd ? (
            <button
              type="button"
              aria-label="Adicionar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)] active:scale-95"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addToCart({
                  productId: product.id,
                  productSlug: product.slug,
                  productName: product.name,
                  imageUrl: product.image_url,
                  basePrice: product.base_price,
                  unitPrice: product.base_price,
                  selectedOptions: [],
                });
                toast.success(storefrontCopy.product.added);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
