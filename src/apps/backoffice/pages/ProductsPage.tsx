import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Package, Plus, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { EmptyState } from "@/shared/components/EmptyState";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import {
  AdminFilterPills,
  AdminPagination,
  BackLink,
  PageHeader,
} from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, availability]);

  const listParams = {
    page: String(page),
    page_size: String(ADMIN_PAGE_SIZE),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(availability ? { is_available: availability } : {}),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...catalogAdminKeys.products(), listParams],
    queryFn: () => catalogAdminApi.listProducts(listParams),
    placeholderData: (prev) => prev,
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
  const hasFilters = Boolean(debouncedSearch || availability);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BackLink to="/" label="Dashboard" />
        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => navigate("/produtos/novo")}
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </div>

      <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <PageHeader
            title="Produtos"
            subtitle={adminCopy.products.subtitle}
            icon={Package}
            className="min-w-0 flex-1 border-0 pb-0"
          />

          <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[min(100%,20rem)]">
            <label className="group relative flex items-center">
              <Search className="pointer-events-none absolute left-0 h-4 w-4 text-[hsl(var(--muted-foreground))] transition group-focus-within:text-brand" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produto…"
                aria-label="Buscar produtos"
                className={cn(
                  "h-10 w-full border-0 border-b border-[hsl(var(--border))] bg-transparent py-2 pl-7 pr-8 text-sm outline-none transition",
                  "placeholder:text-[hsl(var(--muted-foreground))]",
                  "focus:border-brand",
                )}
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  className="absolute right-0 flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              {total > 0 ? (
                <>
                  <span className="font-semibold text-[hsl(var(--foreground))]">{total}</span>
                  {total === 1 ? " produto" : " produtos"}
                  {hasFilters ? " encontrados" : " no cardápio"}
                </>
              ) : (
                "Filtre por nome ou disponibilidade"
              )}
            </p>
          </div>
        </div>

        <AdminFilterPills
          options={AVAILABILITY_FILTERS}
          value={availability}
          onChange={setAvailability}
          size="sm"
        />
      </div>

      {isLoading && !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
          <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        </div>
      ) : products.length ? (
        <div className={cn("space-y-4", isFetching && "opacity-80 transition-opacity")}>
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
