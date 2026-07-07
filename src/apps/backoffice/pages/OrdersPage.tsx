import { useState } from "react";
import { Link } from "react-router";

import { useOrders } from "@/features/orders/hooks/useOrders";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";

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
  const [status, setStatus] = useState("");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Gerencie os pedidos do dia</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar número, nome ou telefone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-xs"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(event) => setActiveOnly(event.target.checked)}
          />
          Só ativos
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
      ) : data?.results.length ? (
        <ul className="space-y-3">
          {data.results.map((order) => (
            <li key={order.id}>
              <Link to={`/pedidos/${order.id}`}>
                <Card className="transition-colors hover:border-[hsl(var(--primary))]">
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
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Nenhum pedido encontrado.</p>
      )}
    </div>
  );
}
