import { Link } from "react-router";
import { ArrowRight, Sparkles, Star, UtensilsCrossed } from "lucide-react";

import { useCompanyPublic } from "@/features/company";
import {
  CategoryNav,
  CategoryNavSkeleton,
  ProductList,
  ProductListSkeleton,
  useCategories,
  useProducts,
} from "@/features/catalog";
import { EmptyState } from "@/shared/components/EmptyState";
import { SectionHeading } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { storefrontCopy } from "@/shared/copy/storefront";

export function HomePage() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError: productsError } = useProducts({
    page_size: 12,
  });

  const products = productsPage?.results ?? [];

  return (
    <div className="space-y-10">
      <section className="gradient-hero relative overflow-hidden rounded-2xl p-6 text-[hsl(var(--primary-foreground))] shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="relative space-y-4">
          {loadingCompany ? (
            <>
              <Skeleton className="h-9 w-64 bg-white/20" />
              <Skeleton className="h-5 w-full max-w-xl bg-white/20" />
            </>
          ) : (
            <>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium ring-1 ring-white/25">
                <Sparkles className="h-4 w-4" />
                {storefrontCopy.home.welcome(company?.trade_name ?? "nossa loja").subtitle}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {company?.trade_name ?? "Cardápio digital"}
              </h1>
              <p className="max-w-xl text-white/90">
                {company?.description ?? "Peça online com delivery ou retirada, no seu ritmo."}
              </p>
            </>
          )}
          <Link to="/cardapio">
            <Button size="lg" className="gap-2 bg-white text-brand shadow-lg hover:bg-[hsl(var(--primary-soft))]">
              Ver cardápio completo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
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

      <section className="space-y-4">
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
