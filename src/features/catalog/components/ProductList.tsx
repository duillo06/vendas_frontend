import { useMemo } from "react";

import { useAddToCart } from "@/features/cart";
import type { ProductListItem } from "../types/catalog.types";

import { ProductCard } from "@/shared/components/ProductCard";

type ProductListProps = {
  products: ProductListItem[];
};

export function ProductList({ products }: ProductListProps) {
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
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Nenhum produto encontrado nesta categoria.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
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
          unavailable={!product.is_available}
          onQuickAdd={quickAddMap.get(product.id)}
        />
      ))}
    </div>
  );
}

export { ProductListSkeleton } from "./ProductListSkeleton";
