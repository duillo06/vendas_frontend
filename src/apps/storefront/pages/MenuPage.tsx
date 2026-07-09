import { Search, UtensilsCrossed } from "lucide-react";
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
import { PageHeader } from "@/shared/components/visual";
import { Input } from "@/shared/components/ui/input";
import { storefrontCopy } from "@/shared/copy/storefront";

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
      <PageHeader
        variant="hero"
        accent="chart-1"
        icon={UtensilsCrossed}
        title="Cardápio"
        subtitle={
          productsPage
            ? storefrontCopy.menu.count(productsPage.count)
            : storefrontCopy.menu.subtitle
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={storefrontCopy.menu.searchPlaceholder}
          className="border-brand-soft bg-white pl-9 shadow-sm ring-brand focus-visible:ring-2"
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
