import { useState } from "react";
import { Link, useParams } from "react-router";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import { useAdminOrder } from "@/features/orders/hooks/useAdminOrder";
import { useUpdateOrderPayment } from "@/features/orders/hooks/useUpdateOrderPayment";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useUpdateOrderStatus";
import {
  ORDER_NEXT_STATUS,
  type OrderAdminDetail,
} from "@/features/orders/types/order-admin.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  confirmed: "Confirmar",
  preparing: "Iniciar preparo",
  ready: "Marcar pronto",
  out_for_delivery: "Saiu para entrega",
  completed: "Concluir",
  cancelled: "Cancelar pedido",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  card_on_delivery: "Cartão na entrega",
};

function OrderActions({ order }: { order: OrderAdminDetail }) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(order.id);
  const { mutate: updatePayment, isPending: paying } = useUpdateOrderPayment(order.id);
  const [cancelNotes, setCancelNotes] = useState("");

  const nextStatuses = ORDER_NEXT_STATUS[order.status] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={status === "cancelled" ? "outline" : "default"}
            disabled={isPending}
            onClick={() => {
              if (status === "cancelled" && !cancelNotes.trim()) {
                return;
              }
              updateStatus({
                status,
                notes: status === "cancelled" ? cancelNotes : undefined,
              });
            }}
          >
            {ACTION_LABELS[status] ?? status}
          </Button>
        ))}
      </div>

      {nextStatuses.includes("cancelled") ? (
        <Input
          placeholder="Motivo do cancelamento (obrigatório)"
          value={cancelNotes}
          onChange={(event) => setCancelNotes(event.target.value)}
        />
      ) : null}

      {order.payment?.status === "pending" ? (
        <Button type="button" variant="outline" disabled={paying} onClick={() => updatePayment()}>
          Registrar pagamento recebido
        </Button>
      ) : null}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id, { polling: true });

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/pedidos" className="text-sm text-[hsl(var(--primary))] hover:underline">
            ← Voltar aos pedidos
          </Link>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">{order.customer.name}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderActions order={order} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Itens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="border-b border-[hsl(var(--border))] pb-3 last:border-0">
                <div className="flex justify-between gap-2">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <PriceDisplay value={item.total_price} />
                </div>
                {item.options.length ? (
                  <ul className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {item.options.map((opt) => (
                      <li key={`${opt.option_group_name}-${opt.option_name}`}>
                        {opt.option_group_name}: {opt.option_name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <div className="space-y-1 border-t border-[hsl(var(--border))] pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <PriceDisplay value={order.subtotal} />
              </div>
              {order.delivery_fee > 0 ? (
                <div className="flex justify-between">
                  <span>Entrega</span>
                  <PriceDisplay value={order.delivery_fee} />
                </div>
              ) : null}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <PriceDisplay value={order.total} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente e entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>{order.customer.name}</strong>
            </p>
            <p>{order.customer.phone}</p>
            <p>{order.delivery_type === "delivery" ? "Entrega" : "Retirada"}</p>
            {order.delivery_address ? (
              <p className="text-[hsl(var(--muted-foreground))]">
                {order.delivery_address.street}, {order.delivery_address.number} —{" "}
                {order.delivery_address.neighborhood}
              </p>
            ) : null}
            {order.notes ? <p className="text-[hsl(var(--muted-foreground))]">Obs: {order.notes}</p> : null}
            {order.payment ? (
              <p>
                Pagamento: {PAYMENT_LABELS[order.payment.method] ?? order.payment.method} —{" "}
                {order.payment.status === "paid" ? "Pago" : "Pendente"}
                {order.payment.change_for ? ` · Troco para R$ ${order.payment.change_for.toFixed(2)}` : ""}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
