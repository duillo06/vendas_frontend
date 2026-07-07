import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/ui/input";

export function MenuPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError } = useProducts({
    search: debouncedSearch || undefined,
    page_size: 24,
  });

  const products = productsPage?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cardápio</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          {productsPage ? `${productsPage.count} produto(s)` : "Carregando..."}
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          className="pl-9"
        />
      </div>

      {loadingCategories ? <CategoryNavSkeleton /> : categories ? <CategoryNav categories={categories} /> : null}

      {loadingProducts ? (
        <ProductListSkeleton />
      ) : isError ? (
        <EmptyState title="Erro ao carregar cardápio" />
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
