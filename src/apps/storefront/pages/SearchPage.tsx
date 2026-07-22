import { useMemo } from "react";
import { Link } from "react-router";
import { Clock, Heart, Search, X } from "lucide-react";

import {
  CategoryNav,
  ProductListRow,
  ProductListRowSkeleton,
  ProductRail,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { CatalogSearchBar } from "@/features/storefront/components/CatalogSearchBar";
import { useCatalogSearch } from "@/features/storefront/hooks/useCatalogSearch";
import { useSearchHistory } from "@/features/storefront/hooks/useSearchHistory";
import { searchPlaceholders } from "@/features/storefront/utils/homeSections";
import { EmptyState } from "@/shared/components/EmptyState";
import { storefrontCopy } from "@/shared/copy/storefront";
import { Button } from "@/shared/components/ui/button";

export function SearchPage() {
  const { search, setSearch, debouncedSearch } = useCatalogSearch();
  const { history, push, remove, clear } = useSearchHistory();
  const { data: categories } = useCategories();
  const { data: catalogPage } = useProducts({ page_size: 48 });
  const {
    data: resultsPage,
    isLoading: loadingResults,
    isError,
  } = useProducts({
    search: debouncedSearch || undefined,
    page_size: 48,
  });

  const catalog = catalogPage?.results ?? [];
  const results = resultsPage?.results ?? [];
  const categoryList = categories ?? [];
  const hasQuery = Boolean(debouncedSearch.trim());

  const placeholders = useMemo(
    () => searchPlaceholders(categoryList.map((c) => c.name)),
    [categoryList],
  );

  const suggestions = useMemo(() => {
    const fromCats = categoryList.map((c) => ({
      label: c.name,
      kind: "category" as const,
    }));
    const fromProducts = catalog.slice(0, 40).map((p) => ({
      label: p.name,
      kind: "product" as const,
    }));
    return [...fromCats, ...fromProducts];
  }, [categoryList, catalog]);

  const bestsellers = useMemo(
    () =>
      catalog.filter(
        (p) =>
          p.is_available && p.tags.some((t) => /mais vendido|destaque|popular/i.test(t)),
      ).slice(0, 12),
    [catalog],
  );

  const applyTerm = (term: string) => {
    setSearch(term);
    push(term);
  };

  const submitSearch = () => {
    if (search.trim()) push(search);
  };

  return (
    <div className="space-y-5 pb-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{storefrontCopy.search.title}</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {storefrontCopy.search.subtitle}
        </p>
      </div>

      <CatalogSearchBar
        value={search}
        onChange={setSearch}
        onSubmit={submitSearch}
        autoFocus
        placeholders={placeholders}
        suggestions={suggestions}
        onPickSuggestion={applyTerm}
      />

      {!hasQuery ? (
        <div className="space-y-6">
          {history.length > 0 ? (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{storefrontCopy.search.historyTitle}</h2>
                <button
                  type="button"
                  className="text-xs font-medium text-brand hover:underline"
                  onClick={clear}
                >
                  {storefrontCopy.search.clearHistory}
                </button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {history.map((term) => (
                  <li key={term}>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--border))] bg-white py-1 pr-1 pl-2.5 text-sm shadow-[var(--shadow-xs)]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-medium"
                        onClick={() => applyTerm(term)}
                      >
                        <Clock className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                        {term}
                      </button>
                      <button
                        type="button"
                        aria-label={`Remover ${term}`}
                        className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                        onClick={() => remove(term)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {categoryList.length > 0 ? (
            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold">{storefrontCopy.search.categoriesTitle}</h2>
              <CategoryNav categories={categoryList} showAllOption={false} />
            </section>
          ) : null}

          {bestsellers.length > 0 ? (
            <ProductRail
              title={storefrontCopy.search.popularTitle}
              subtitle={storefrontCopy.search.popularHint}
              products={bestsellers}
            />
          ) : null}

          <Link
            to="/favoritos"
            className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 shadow-[var(--shadow-xs)] transition hover:border-[hsl(var(--primary)/0.35)]"
          >
            <Heart className="h-5 w-5 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{storefrontCopy.search.favoritesLink}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {storefrontCopy.search.favoritesHint}
              </p>
            </div>
          </Link>
        </div>
      ) : loadingResults ? (
        <ProductListRowSkeleton count={6} />
      ) : isError ? (
        <EmptyState title="Erro ao buscar" accent="chart-1" />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title={storefrontCopy.menu.searchEmpty.title}
          description={storefrontCopy.menu.searchEmpty.description}
          accent="chart-2"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {storefrontCopy.menu.searchResults(resultsPage?.count ?? results.length, debouncedSearch)}
          </p>
          <ul className="divide-y divide-[hsl(0_0%_90%)] border-t border-[hsl(0_0%_90%)]">
            {results.map((product, index) => (
              <li key={product.id}>
                <ProductListRow product={product} staggerIndex={index} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && results.length > 0 ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => setSearch("")}>
          {storefrontCopy.search.backToBrowse}
        </Button>
      ) : null}
    </div>
  );
}
