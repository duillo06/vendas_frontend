import { useState } from "react";
import { ClipboardList, RefreshCw, ShoppingBag } from "lucide-react";
import { useSearchParams } from "react-router";

import { useOrders } from "@/features/orders/hooks/useOrders";
import { EmptyState } from "@/shared/components/EmptyState";
import { UiHint } from "@/shared/components/UiHint";
import { AdminFilterPills, AdminOrderCard, BackLink, PageHeader } from "@/shared/components/visual";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import type { OrderStatus } from "@/shared/components/OrderStatusBadge";

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
      <BackLink to="/" label="Dashboard" />

      <PageHeader
        title="Pedidos"
        subtitle={adminCopy.orders.subtitle}
        icon={ShoppingBag}
      />

      <UiHint icon={RefreshCw} tone="warm">
        {adminCopy.orders.guidance}
      </UiHint>

      <div className="glass-panel rounded-2xl p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1 sm:max-w-md sm:flex-1">
            <Input
              placeholder="Buscar número, nome ou telefone"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="border-[hsl(var(--border))] bg-white"
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{adminCopy.orders.searchHint}</p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm transition hover:border-[hsl(var(--primary)/0.3)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
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
      </div>

      <AdminFilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : orders.length ? (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <AdminOrderCard
                id={order.id}
                orderNumber={order.order_number}
                customerName={order.customer_name}
                createdAt={formatDateTime(order.created_at)}
                status={order.status as OrderStatus}
                total={order.total}
                itemsCount={order.items_count}
                deliveryType={order.delivery_type as "delivery" | "pickup"}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={adminCopy.orders.empty.title}
          description={hasFilters ? adminCopy.orders.empty.filtered : adminCopy.orders.empty.waiting}
          accent="chart-3"
        />
      )}
    </div>
  );
}
