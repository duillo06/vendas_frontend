import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

import { customersAdminApi } from "@/features/customers";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { UiHint } from "@/shared/components/UiHint";
import { BackLink } from "@/shared/components/visual";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: () => customersAdminApi.get(id!),
    enabled: Boolean(id),
  });

  if (isLoading || !customer) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink to="/clientes" label="Clientes" />

      <div>
        <h1 className="text-2xl font-bold">{customer.full_name}</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          {customer.phone}
          {customer.email ? ` · ${customer.email}` : ""}
        </p>
      </div>

      <UiHint tone="neutral">{adminCopy.customers.detail.metrics}</UiHint>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Pedidos</p>
            <p className="text-2xl font-bold">{customer.total_orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Total gasto</p>
            <p className="text-2xl font-bold">
              <PriceDisplay value={customer.total_spent} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Conta</p>
            <p className="text-2xl font-bold">{customer.has_account ? "Ativa" : "Guest"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.customers.detail.orders}
          </p>
        </CardHeader>
        <CardContent>
          {customer.recent_orders.length ? (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {customer.recent_orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/pedidos/${order.id}`}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      <PriceDisplay value={order.total} className="font-semibold" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum pedido ainda.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Endereços salvos</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {adminCopy.customers.detail.addresses}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {customer.addresses.length ? (
            customer.addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-[hsl(var(--border))] p-3 text-sm">
                <p className="font-medium">
                  {address.label || "Endereço"}
                  {address.is_default ? " (padrão)" : ""}
                </p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {address.street}, {address.number} — {address.neighborhood}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum endereço cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
