import { Link } from "react-router";
import { Plus } from "lucide-react";

import { useAddToCart } from "@/features/cart";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { resolveRelatedSectionCopy } from "@/features/catalog/utils/relatedSuggestions";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { storefrontCopy } from "@/shared/copy/storefront";
import { resolveMediaUrl } from "@/shared/lib/media";
import { cn } from "@/shared/lib/utils";

type ProductSuggestionRailProps = {
  products: ProductListItem[];
  currentProductName: string;
  currentCategoryName?: string;
  className?: string;
};

/** carrossel compacto — nunca compete com o produto principal */
export function ProductSuggestionRail({
  products,
  currentProductName,
  currentCategoryName,
  className,
}: ProductSuggestionRailProps) {
  const addToCart = useAddToCart();
  const copy = resolveRelatedSectionCopy(currentProductName, currentCategoryName);

  if (products.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)} aria-label={copy.title}>
      <div className="px-0.5">
        <h2 className="text-base font-semibold tracking-tight text-[hsl(var(--foreground))]/90">
          <span className="mr-1.5" aria-hidden>
            {copy.emoji}
          </span>
          {copy.title}
        </h2>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.product.relatedHint}
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-3">
          {products.map((product) => (
            <li key={product.id} className="w-[9.5rem] shrink-0 sm:w-[10.5rem]">
              <SuggestionCard
                product={product}
                onQuickAdd={() => {
                  if (product.has_options) return;
                  addToCart({
                    productId: product.id,
                    productSlug: product.slug,
                    productName: product.name,
                    imageUrl: product.image_url,
                    basePrice: product.base_price,
                    unitPrice: product.base_price,
                    selectedOptions: [],
                  });
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SuggestionCard({
  product,
  onQuickAdd,
}: {
  product: ProductListItem;
  onQuickAdd: () => void;
}) {
  const image = resolveMediaUrl(product.image_url);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white",
        "shadow-[var(--shadow-xs)] transition hover:border-[hsl(var(--primary)/0.25)]",
        !product.is_available && "opacity-55",
      )}
    >
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="aspect-[5/4] overflow-hidden bg-[hsl(var(--muted))]">
          {image ? (
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl opacity-40">🍽️</div>
          )}
        </div>
        <div className="space-y-0.5 p-2.5 pr-10">
          <p className="line-clamp-2 text-xs font-medium leading-snug">{product.name}</p>
          <PriceDisplay value={product.base_price} className="text-sm font-semibold text-brand" />
        </div>
      </Link>

      {product.is_available && !product.has_options ? (
        <button
          type="button"
          aria-label={`Adicionar ${product.name}`}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[hsl(var(--primary-foreground))] shadow-sm transition hover:scale-105"
          onClick={(event) => {
            event.preventDefault();
            onQuickAdd();
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      ) : product.is_available && product.has_options ? (
        <Link
          to={`/produto/${product.slug}`}
          aria-label={`Ver ${product.name}`}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-white text-brand shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </Link>
      ) : null}
    </article>
  );
}
