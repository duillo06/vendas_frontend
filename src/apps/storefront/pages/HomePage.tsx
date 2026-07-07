import { Link } from "react-router";
import { UtensilsCrossed } from "lucide-react";

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
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function HomePage() {
  const { data: company, isLoading: loadingCompany } = useCompanyPublic();
  const { data: categories, isLoading: loadingCategories, isError: categoriesError } = useCategories();
  const { data: productsPage, isLoading: loadingProducts, isError: productsError } = useProducts({
    page_size: 12,
  });

  const products = productsPage?.results ?? [];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        {loadingCompany ? (
          <>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">
              {company?.trade_name ?? "Cardápio digital"}
            </h1>
            <p className="max-w-xl text-[hsl(var(--muted-foreground))]">
              {company?.description ?? "Peça online com delivery ou retirada."}
            </p>
          </>
        )}
        <Link to="/cardapio">
          <Button>Ver cardápio completo</Button>
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Categorias</h2>
        {loadingCategories ? (
          <CategoryNavSkeleton />
        ) : categoriesError ? (
          <EmptyState
            title="Não foi possível carregar categorias"
            description="Verifique se o backend está rodando e o tenant demo está ativo."
          />
        ) : categories && categories.length > 0 ? (
          <CategoryNav categories={categories} />
        ) : (
          <EmptyState icon={UtensilsCrossed} title="Nenhuma categoria cadastrada" />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Destaques</h2>
          <Link to="/cardapio" className="text-sm font-medium text-[hsl(var(--primary))] hover:underline">
            Ver todos
          </Link>
        </div>
        {loadingProducts ? (
          <ProductListSkeleton count={6} />
        ) : productsError ? (
          <EmptyState title="Erro ao carregar produtos" />
        ) : (
          <ProductList products={products} />
        )}
      </section>
    </div>
  );
}
