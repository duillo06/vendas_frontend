import { useMemo } from "react";
import { Search } from "lucide-react";

import { useAddToCart } from "@/features/cart";
import type { ProductListItem } from "../types/catalog.types";

import { EmptyState } from "@/shared/components/EmptyState";
import { ProductCard } from "@/shared/components/ProductCard";
import { storefrontCopy } from "@/shared/copy/storefront";

type ProductListProps = {
  products: ProductListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ProductList({
  products,
  emptyTitle = storefrontCopy.menu.empty.title,
  emptyDescription = storefrontCopy.menu.empty.description,
}: ProductListProps) {
  const addToCart = useAddToCart();

  const quickAddMap = useMemo(() => {
    const map = new Map<string, () => void>();
    for (const product of products) {
      if (!product.is_available || product.has_options) {
        continue;
      }
      map.set(product.id, () =>
        addToCart({
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          imageUrl: product.image_url,
          basePrice: product.base_price,
          unitPrice: product.base_price,
          selectedOptions: [],
        }),
      );
    }
    return map;
  }, [products, addToCart]);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title={emptyTitle}
        description={emptyDescription}
        accent="chart-2"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          id={product.id}
          slug={product.slug}
          name={product.name}
          description={product.description ?? undefined}
          price={product.base_price}
          comparePrice={product.compare_price}
          imageUrl={product.image_url}
          tags={product.tags}
          prepTime={product.prep_time}
          unavailable={!product.is_available}
          hasOptions={product.has_options}
          onQuickAdd={quickAddMap.get(product.id)}
          staggerIndex={index}
        />
      ))}
    </div>
  );
}

export { ProductListSkeleton } from "./ProductListSkeleton";
