import { useState } from "react";
import { ClipboardList, RefreshCw, ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { useOrders } from "@/features/orders/hooks/useOrders";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "confirmed,preparing,ready,out_for_delivery", label: "Em andamento" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
];

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";
  const [status, setStatus] = useState(
    STATUS_FILTERS.some((filter) => filter.value === initialStatus) ? initialStatus : "",
  );
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  const { data, isLoading } = useOrders(
    {
      status: status || undefined,
      search: search || undefined,
      active: activeOnly,
    },
    { polling: true },
  );

  const hasFilters = Boolean(status || search.trim());
  const orders = data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        subtitle={adminCopy.orders.subtitle}
        icon={ShoppingBag}
        accent="chart-3"
      />

      <UiHint icon={RefreshCw} tone="warm">
        {adminCopy.orders.guidance}
      </UiHint>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1 sm:max-w-xs sm:flex-1">
          <Input
            placeholder="Buscar número, nome ou telefone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{adminCopy.orders.searchHint}</p>
        </div>
        <label className="flex items-center gap-2 text-sm sm:self-start sm:pt-2">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => setActiveOnly(event.target.checked)}
          />
          <span>
            Só ativos
            <span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))]">
              {adminCopy.orders.activeOnlyHelp}
            </span>
          </span>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value || "all"}
            type="button"
            size="sm"
            variant={status === filter.value ? "default" : "outline"}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : orders.length ? (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/pedidos/${order.id}`}>
                <Card className="interactive-card transition-colors hover:border-[hsl(var(--primary)/0.35)]">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">
                        {order.order_number} — {order.customer_name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDateTime(order.created_at)} · {order.items_count} itens ·{" "}
                        {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      <PriceDisplay value={order.total} className="font-semibold" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
            <ClipboardList className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="font-medium">{adminCopy.orders.empty.title}</p>
          <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
            {hasFilters ? adminCopy.orders.empty.filtered : adminCopy.orders.empty.waiting}
          </p>
        </div>
      )}
    </div>
  );
}
