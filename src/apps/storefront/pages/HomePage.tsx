import { Link, useNavigate } from "react-router";
import { Star, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { CatalogSearchSection } from "@/features/storefront/components/CatalogSearchSection";
import { StoreHero } from "@/features/storefront/components/StoreHero";
import { useCompanyPublic } from "@/features/company";
import { EmptyState } from "@/shared/components/EmptyState";
import { SectionHeading } from "@/shared/components/visual";
import { storefrontCopy } from "@/shared/copy/storefront";

export function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError: productsError } = useProducts({
    page_size: 12,
  });

  const products = productsPage?.results ?? [];

  const goToMenuSearch = () => {
    const query = search.trim();
    navigate(query ? `/cardapio?q=${encodeURIComponent(query)}` : "/cardapio");
  };

  return (
    <div className="space-y-4 sm:space-y-7">
      <StoreHero company={company} isLoading={loadingCompany} />

      <CatalogSearchSection value={search} onChange={setSearch} onSubmit={goToMenuSearch} />

      <section className="space-y-3 sm:space-y-4">
        <SectionHeading title="Categorias" icon={UtensilsCrossed} accent="chart-2" />
        {loadingCategories ? (
          <CategoryNavSkeleton />
        ) : categoriesError ? (
          <EmptyState
            title="Não foi possível carregar categorias"
            description="Verifique se o backend está rodando e o tenant demo está ativo."
            accent="chart-2"
          />
        ) : categories && categories.length > 0 ? (
          <CategoryNav categories={categories} />
        ) : (
          <EmptyState icon={UtensilsCrossed} title="Nenhuma categoria cadastrada" accent="chart-2" />
        )}
      </section>

      <section className="space-y-3 sm:space-y-4">
        <SectionHeading
          title="Destaques"
          description={storefrontCopy.home.highlights}
          icon={Star}
          accent="chart-4"
          action={
            <Link to="/cardapio" className="text-sm font-semibold text-brand hover:underline">
              Ver todos
            </Link>
          }
        />
        {loadingProducts ? (
          <ProductListSkeleton count={6} />
        ) : productsError ? (
          <EmptyState title="Erro ao carregar produtos" accent="chart-4" />
        ) : (
          <ProductList products={products} />
        )}
      </section>
    </div>
  );
}
