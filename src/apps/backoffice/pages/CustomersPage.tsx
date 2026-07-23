import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

import { customersAdminApi } from "@/features/customers";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink, PageHeader } from "@/shared/components/visual";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function CustomersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", search],
    queryFn: () => customersAdminApi.list({ search: search || undefined }),
  });

  const customers = data?.results ?? [];
  const hasSearch = Boolean(search.trim());

  return (
    <div className="space-y-6">
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        title="Clientes"
        subtitle={adminCopy.customers.subtitle}
        icon={Users}
      />

      <UiHint icon={Users} tone="warm">
        {adminCopy.customers.guidance}
      </UiHint>

      <div className="glass-panel space-y-1 rounded-2xl p-4 sm:max-w-md">
        <Input
          placeholder="Buscar nome, telefone ou e-mail"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{adminCopy.customers.searchHint}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : customers.length ? (
        <ul className="space-y-3">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link to={`/clientes/${customer.id}`}>
                <Card className="interactive-card transition-colors hover:border-[hsl(var(--primary)/0.35)]">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{customer.full_name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {customer.phone}
                        {customer.has_account ? " · com conta" : " · guest"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>
                        {customer.total_orders}{" "}
                        {customer.total_orders === 1 ? "pedido" : "pedidos"}
                      </p>
                      <PriceDisplay value={customer.total_spent} className="font-medium" />
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Último: {formatDateTime(customer.last_order_at)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <p className="font-medium">{adminCopy.customers.empty.title}</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {hasSearch ? adminCopy.customers.empty.filtered : adminCopy.customers.empty.description}
          </p>
        </div>
      )}
    </div>
  );
}
