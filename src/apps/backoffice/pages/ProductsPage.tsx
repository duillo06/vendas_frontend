import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

export function ProductsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Gerencie o cardápio</p>
        </div>
        <Link
          to="/produtos/novo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[hsl(var(--primary))] px-4 text-sm font-medium text-[hsl(var(--primary-foreground))]"
        >
          Novo produto
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : data?.results.length ? (
        <ul className="space-y-3">
          {data.results.map((product) => (
            <li key={product.id}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-14 w-14 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-xs">
                        Sem foto
                      </div>
                    )}
                    <div>
                      <Link to={`/produtos/${product.id}`} className="font-semibold hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {product.category.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriceDisplay value={product.base_price} />
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        product.is_available
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700",
                      )}
                      onClick={() =>
                        toggleAvailable.mutate({
                          id: product.id,
                          is_available: !product.is_available,
                        })
                      }
                    >
                      {product.is_available ? "Disponível" : "Indisponível"}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum produto cadastrado.</p>
      )}
    </div>
  );
}
