import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Lightbulb, Package, Plus, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader, BackLink } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

export function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: catalogAdminKeys.products(),
    queryFn: () => catalogAdminApi.listProducts(),
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      catalogAdminApi.updateProduct(id, { is_available }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
    },
  });

  const products = data?.results ?? [];
  const availableCount = products.filter((p) => p.is_available).length;

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        title="Produtos"
        subtitle={adminCopy.products.subtitle}
        icon={Package}
        action={
          <Button
            type="button"
            size="lg"
            className="w-full gap-2 bg-white text-brand shadow-lg hover:bg-[hsl(var(--primary-soft))] sm:w-auto"
            onClick={() => navigate("/produtos/novo")}
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <UiHint icon={Lightbulb} tone="warm">
        {adminCopy.products.tip}
      </UiHint>

      {!isLoading && products.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-brand" />
            {products.length} no cardápio
          </span>
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Package className="h-4 w-4 text-brand" />
            {availableCount} disponíveis
          </span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : products.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <article className="product-card-premium group h-full overflow-hidden">
                <Link to={`/produtos/${product.id}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
                        <ImageIcon className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        product.is_available
                          ? "bg-brand text-[hsl(var(--primary-foreground))]"
                          : "bg-red-500 text-white",
                      )}
                    >
                      {product.is_available ? "No cardápio" : "Pausado"}
                    </span>
                  </div>
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <Link
                      to={`/produtos/${product.id}`}
                      className="font-semibold leading-tight hover:text-brand"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{product.category.name}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <PriceDisplay value={product.base_price} className="text-lg font-bold text-brand" />
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        product.is_available
                          ? "bg-brand-soft text-brand hover:bg-brand hover:text-[hsl(var(--primary-foreground))]"
                          : "bg-red-50 text-red-700 hover:bg-red-100",
                      )}
                      onClick={() =>
                        toggleAvailable.mutate({
                          id: product.id,
                          is_available: !product.is_available,
                        })
                      }
                    >
                      {product.is_available ? "Pausar" : "Ativar"}
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Package}
          title={adminCopy.products.empty.title}
          description={adminCopy.products.empty.description}
          accent="chart-2"
          action={
            <Button type="button" className="gap-2" onClick={() => navigate("/produtos/novo")}>
              <Plus className="h-4 w-4" />
              Novo produto
            </Button>
          }
        />
      )}
    </div>
  );
}
