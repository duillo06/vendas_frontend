import { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { Heart } from "lucide-react";

import { ProductListRow, ProductListRowSkeleton, useProducts } from "@/features/catalog";
import { useFavorites } from "@/features/favorites";
import { EmptyState } from "@/shared/components/EmptyState";
import { storefrontCopy } from "@/shared/copy/storefront";

export function FavoritesPage() {
  const { favorites, prune } = useFavorites();
  const { data: productsPage, isLoading, isError } = useProducts({ page_size: 100 });

  const catalogComplete = Boolean(productsPage && !productsPage.next);

  // limpa favoritos órfãos quando o cardápio carregou por completo
  useEffect(() => {
    if (!catalogComplete || !productsPage?.results) return;
    prune(productsPage.results.map((p) => p.id));
  }, [catalogComplete, productsPage?.results, prune]);

  const products = useMemo(() => {
    const all = productsPage?.results ?? [];
    const order = new Map(favorites.map((id, i) => [id, i]));
    return all
      .filter((p) => order.has(p.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [productsPage?.results, favorites]);

  if (!favorites.length || (!isLoading && !isError && products.length === 0 && catalogComplete)) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {storefrontCopy.favorites.title}
        </h1>
        <EmptyState
          icon={Heart}
          title={storefrontCopy.favorites.emptyTitle}
          description={storefrontCopy.favorites.emptyDescription}
          accent="chart-1"
        />
        <Link
          to="/buscar"
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)]"
        >
          {storefrontCopy.favorites.browseCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {storefrontCopy.favorites.title}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.favorites.count(products.length || favorites.length)}
        </p>
      </div>

      {isLoading ? (
        <ProductListRowSkeleton count={4} />
      ) : isError ? (
        <EmptyState title="Erro ao carregar favoritos" accent="chart-1" />
      ) : (
        <ul className="divide-y divide-[hsl(0_0%_90%)] border-t border-[hsl(0_0%_90%)]">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductListRow product={product} staggerIndex={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
