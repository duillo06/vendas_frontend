import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Phone, Search, ShoppingBag, Users, X } from "lucide-react";
import { Link } from "react-router";

import { customersAdminApi } from "@/features/customers";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { AdminPagination, BackLink, PageHeader } from "@/shared/components/visual";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ADMIN_PAGE_SIZE } from "@/shared/constants/adminList";
import { adminCopy } from "@/shared/copy/admin";
import { formatPhoneMask } from "@/shared/lib/phone";
import { cn } from "@/shared/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin", "customers", debouncedSearch, page],
    queryFn: () =>
      customersAdminApi.list({
        search: debouncedSearch || undefined,
        page,
        page_size: ADMIN_PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  const customers = data?.results ?? [];
  const total = data?.count ?? 0;
  const hasSearch = Boolean(debouncedSearch);

  return (
    <div className="space-y-4 sm:space-y-5">
      <BackLink to="/" label="Dashboard" />

      <div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <PageHeader
          title="Clientes"
          subtitle={adminCopy.customers.subtitle}
          icon={Users}
          className="min-w-0 flex-1 border-0 pb-0"
        />

        <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-[min(100%,20rem)]">
          <label className="group relative flex items-center">
            <Search className="pointer-events-none absolute left-0 h-4 w-4 text-[hsl(var(--muted-foreground))] transition group-focus-within:text-brand" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, telefone ou e-mail…"
              aria-label="Buscar clientes"
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
                {total === 1 ? " cliente" : " clientes"}
                {hasSearch ? " encontrados" : " na loja"}
              </>
            ) : (
              adminCopy.customers.searchHint
            )}
          </p>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : customers.length ? (
        <div className={cn("space-y-3", isFetching && "opacity-80 transition-opacity")}>
          <ul className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_-6px_rgb(0_0_0/0.12)] ring-1 ring-black/[0.04]">
            {customers.map((customer, index) => (
              <li
                key={customer.id}
                className={cn(index > 0 && "border-t border-[hsl(var(--border))]/70")}
              >
                <Link
                  to={`/clientes/${customer.id}`}
                  className="group flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-[hsl(var(--muted))]/45 sm:gap-4 sm:px-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-bold text-brand">
                    {initials(customer.full_name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold tracking-tight group-hover:text-brand">
                        {customer.full_name}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                          customer.has_account
                            ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] ring-[hsl(var(--border))]",
                        )}
                      >
                        {customer.has_account ? "Com conta" : "Guest"}
                      </span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Phone className="h-3 w-3 shrink-0" />
                        {formatPhoneMask(customer.phone)}
                      </span>
                      {customer.email ? (
                        <span className="truncate">{customer.email}</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      <ShoppingBag className="h-3 w-3" />
                      {customer.total_orders}{" "}
                      {customer.total_orders === 1 ? "pedido" : "pedidos"}
                    </p>
                    <PriceDisplay
                      value={customer.total_spent}
                      className="text-sm font-semibold tabular-nums"
                    />
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      Último: {formatDate(customer.last_order_at)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right sm:hidden">
                    <PriceDisplay
                      value={customer.total_spent}
                      className="text-sm font-semibold tabular-nums"
                    />
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {customer.total_orders} ped.
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              </li>
            ))}
          </ul>

          <AdminPagination page={page} total={total} onPageChange={setPage} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white px-6 py-16 text-center">
          <Users className="mx-auto h-9 w-9 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 font-semibold">{adminCopy.customers.empty.title}</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {hasSearch ? adminCopy.customers.empty.filtered : adminCopy.customers.empty.description}
          </p>
        </div>
      )}
    </div>
  );
}
