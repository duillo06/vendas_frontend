import { Link } from "react-router";

import type { ProductListItem } from "../types/catalog.types";

import { ProductCard } from "@/shared/components/ProductCard";
import { Skeleton } from "@/shared/components/ui/skeleton";

type ProductListProps = {
  products: ProductListItem[];
};

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Nenhum produto encontrado nesta categoria.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product.id} to={`/produto/${product.slug}`}>
          <ProductCard
            name={product.name}
            description={product.description ?? undefined}
            price={product.base_price}
            imageUrl={product.image_url}
            badge={product.tags[0]}
            unavailable={!product.is_available}
          />
        </Link>
      ))}
    </div>
  );
}

export function ProductListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-5 w-1/3" />
        </div>
      ))}
    </div>
  );
}
