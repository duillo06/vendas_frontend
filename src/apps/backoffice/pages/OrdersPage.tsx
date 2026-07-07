import { ClipboardList } from "lucide-react";

import { EmptyState } from "@/shared/components/EmptyState";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Gestão de pedidos — Sprint 8</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <OrderStatusBadge status="pending" />
        <OrderStatusBadge status="preparing" />
        <OrderStatusBadge status="ready" />
        <OrderStatusBadge status="completed" />
      </div>

      <EmptyState
        icon={ClipboardList}
        title="Nenhum pedido ainda"
        description="A lista de pedidos com filtros e ações entra na Sprint 8."
      />
    </div>
  );
}
