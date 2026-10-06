import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Lightbulb, Package, Plus, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import {
  AdminFilterPills,
  AdminPagination,
  BackLink,
  PageHeader,
} from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ADMIN_PAGE_SIZE } from "@/shared/constants/adminList";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

const AVAILABILITY_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "true", label: "No cardápio" },
  { value: "false", label: "Pausados" },
];

export function ProductsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, availability]);

  const listParams = {
    page: String(page),
    page_size: String(ADMIN_PAGE_SIZE),
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(availability ? { is_available: availability } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: [...catalogAdminKeys.products(), listParams],
    queryFn: () => catalogAdminApi.listProducts(listParams),
  });

  const toggleAvailable = useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      catalogAdminApi.updateProduct(id, { is_available }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
    },
  });

  const products = data?.results ?? [];
  const total = data?.count ?? 0;
  const availableCount = products.filter((p) => p.is_available).length;
  const hasFilters = Boolean(search.trim() || availability);

  return (
    <div className="space-y-4 sm:space-y-5">
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

      <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-3 shadow-[var(--shadow-sm)] sm:p-3.5">
        <div className="min-w-0 space-y-1 sm:max-w-md">
          <Input
            placeholder="Buscar por nome do produto"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 border-[hsl(var(--border))] bg-[hsl(var(--background))]"
          />
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Filtra pelo nome — combine com os chips de disponibilidade.
          </p>
        </div>
      </div>

      <AdminFilterPills options={AVAILABILITY_FILTERS} value={availability} onChange={setAvailability} />

      {!isLoading && total > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-medium shadow-[var(--shadow-xs)]">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            {total} no total
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-medium shadow-[var(--shadow-xs)]">
            <Package className="h-3.5 w-3.5 text-brand" />
            {availableCount} nesta página disponíveis
          </span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : products.length ? (
        <div className="space-y-3">
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
                      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        {product.category.name}
                      </p>
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
          <AdminPagination page={page} total={total} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={adminCopy.products.empty.title}
          description={
            hasFilters
              ? "Nada encontrado com esse filtro. Tente outro termo ou limpe os chips."
              : adminCopy.products.empty.description
          }
          accent="chart-2"
          action={
            hasFilters ? undefined : (
              <Button type="button" className="gap-2" onClick={() => navigate("/produtos/novo")}>
                <Plus className="h-4 w-4" />
                Novo produto
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
