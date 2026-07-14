import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UtensilsCrossed } from "lucide-react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductListRow,
  ProductListRowSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { CatalogSearchSection } from "@/features/storefront/components/CatalogSearchSection";
import { HomeWelcomeCard } from "@/features/storefront/components/HomeGreetingBanner";
import {
  buildHomeInsightChips,
  HomeInsightRail,
} from "@/features/storefront/components/HomeInsightRail";
import { StoreHero } from "@/features/storefront/components/StoreHero";
import {
  buildHomeSections,
  searchPlaceholders,
} from "@/features/storefront/utils/homeSections";
import { useCompanyPublic } from "@/features/company";
import { EmptyState } from "@/shared/components/EmptyState";
import { SectionHeading } from "@/shared/components/visual";
import { storefrontCopy } from "@/shared/copy/storefront";

export function HomePage() {
  const navigate = useNavigate();
  const searchBlockRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError: productsError } = useProducts({
    page_size: 48,
  });

  const products = productsPage?.results ?? [];
  const categoryList = categories ?? [];

  const placeholders = useMemo(
    () => searchPlaceholders(categoryList.map((c) => c.name)),
    [categoryList],
  );

  const suggestions = useMemo(() => {
    const fromCats = categoryList.map((c) => ({
      label: c.name,
      kind: "category" as const,
    }));
    const fromProducts = products.slice(0, 40).map((p) => ({
      label: p.name,
      kind: "product" as const,
    }));
    return [...fromCats, ...fromProducts];
  }, [categoryList, products]);

  const sections = useMemo(
    () => buildHomeSections(products, categoryList),
    [products, categoryList],
  );

  const insightChips = useMemo(
    () => buildHomeInsightChips(company, products),
    [company, products],
  );

  const goToMenuSearch = (term = search) => {
    const query = term.trim();
    navigate(query ? `/cardapio?q=${encodeURIComponent(query)}` : "/cardapio");
  };

  const focusSearch = () => {
    searchBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      const input = searchBlockRef.current?.querySelector("input");
      input?.focus();
    }, 280);
  };

  return (
    <div className="space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:space-y-8">
      <StoreHero
        company={company}
        isLoading={loadingCompany}
        onSearchClick={focusSearch}
      />

      <HomeWelcomeCard products={products} />

      <HomeInsightRail chips={insightChips} />

      <div ref={searchBlockRef}>
        <CatalogSearchSection
          value={search}
          onChange={setSearch}
          onSubmit={() => goToMenuSearch()}
          placeholders={placeholders}
          suggestions={suggestions}
          onPickSuggestion={(label) => goToMenuSearch(label)}
        />
      </div>

      <section className="space-y-3">
        <SectionHeading title="Categorias" icon={UtensilsCrossed} accent="chart-2" />
        {loadingCategories ? (
          <CategoryNavSkeleton />
        ) : categoriesError ? (
          <EmptyState
            title="Não foi possível carregar categorias"
            description="Verifique se o backend está rodando e o tenant demo está ativo."
            accent="chart-2"
          />
        ) : categoryList.length > 0 ? (
          <CategoryNav categories={categoryList} />
        ) : (
          <EmptyState icon={UtensilsCrossed} title="Nenhuma categoria cadastrada" accent="chart-2" />
        )}
      </section>

      {loadingProducts ? (
        <section className="space-y-3">
          <SectionHeading
            title="Favoritos da galera"
            description={storefrontCopy.home.highlights}
            accent="chart-4"
          />
          <ProductListRowSkeleton count={6} />
        </section>
      ) : productsError ? (
        <EmptyState title="Erro ao carregar produtos" accent="chart-4" />
      ) : sections.length === 0 ? (
        <EmptyState
          title={storefrontCopy.menu.empty.title}
          description={storefrontCopy.menu.empty.description}
          accent="chart-4"
        />
      ) : (
        sections.map((section, sectionIndex) => (
          <section key={section.id} className="space-y-3 sm:space-y-4">
            <SectionHeading
              title={section.title}
              description={section.description}
              icon={section.icon}
              accent={section.accent === "primary" ? "chart-1" : section.accent}
              action={
                sectionIndex === 0 ? (
                  <Link to="/cardapio" className="text-sm font-semibold text-brand hover:underline">
                    Ver todos →
                  </Link>
                ) : undefined
              }
            />
            {section.products.length === 0 ? (
              <EmptyState
                title="Ainda não temos produtos aqui"
                description="Mas estamos preparando novidades!"
                accent="chart-2"
              />
            ) : (
              <ul className="divide-y divide-[hsl(0_0%_90%)] border-t border-[hsl(0_0%_90%)]">
                {section.products.map((product, index) => (
                  <li key={product.id}>
                    <ProductListRow product={product} staggerIndex={index} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  );
}
