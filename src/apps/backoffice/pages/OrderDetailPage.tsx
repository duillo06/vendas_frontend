import { useState } from "react";
import { ArrowRight, Banknote, MapPin, Package, Phone, Store } from "lucide-react";
import { useParams } from "react-router";

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
import { UiHint } from "@/shared/components/UiHint";
import { OrderStatusTimeline, BackLink, PageHeader } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

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
  const statusHint = adminCopy.orders.detail.statusHints[order.status];

  return (
    <div className="space-y-4">
      {statusHint ? (
        <UiHint
          icon={ArrowRight}
          tone={order.status === "completed" ? "success" : order.status === "cancelled" ? "neutral" : "warm"}
        >
          {statusHint}
        </UiHint>
      ) : null}

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
        <div className="space-y-2">
          <Input
            placeholder="Motivo do cancelamento (obrigatório)"
            value={cancelNotes}
            onChange={(event) => setCancelNotes(event.target.value)}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {adminCopy.orders.detail.cancelHint}
          </p>
        </div>
      ) : null}

      {order.payment?.status === "pending" ? (
        <div className="space-y-2">
          <UiHint icon={Banknote} tone="neutral">
            {adminCopy.orders.detail.paymentPending}
          </UiHint>
          <Button type="button" variant="outline" disabled={paying} onClick={() => updatePayment()}>
            Registrar pagamento recebido
          </Button>
        </div>
      ) : order.payment?.status === "paid" ? (
        <UiHint tone="success">{adminCopy.orders.detail.paymentPaid}</UiHint>
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
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink to="/pedidos" label="Pedidos" />

      <PageHeader
        title={order.order_number}
        subtitle={`${order.customer.name} · ${order.delivery_type === "delivery" ? "Entrega" : "Retirada"}`}
        action={<OrderStatusBadge status={order.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[hsl(var(--border))] shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <CardTitle className="text-base">{adminCopy.orders.detail.actionsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <OrderActions order={order} />
          </CardContent>
        </Card>

        <Card className="border-[hsl(var(--border))] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusTimeline
              currentStatus={order.status}
              history={order.status_history?.map((row) => ({
                status: row.to_status as OrderStatus,
                created_at: row.created_at,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Package className="h-5 w-5 text-brand" />
            <CardTitle className="text-base">Itens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-3"
              >
                <div className="flex justify-between gap-2 font-medium">
                  <span>
                    {item.quantity}x {item.product_name}
                  </span>
                  <PriceDisplay value={item.total_price} />
                </div>
                {item.options.length ? (
                  <ul className="mt-2 space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {item.options.map((opt) => (
                      <li key={`${opt.option_group_name}-${opt.option_name}`}>
                        + {opt.option_group_name}: {opt.option_name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
            <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4">
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
              <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-bold">
                <span>Total</span>
                <PriceDisplay value={order.total} className="text-brand" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="interactive-card">
          <CardHeader className="flex flex-row items-center gap-2">
            <Phone className="h-5 w-5 text-brand" />
            <CardTitle className="text-base">Cliente e entrega</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl border border-[hsl(var(--border))] p-4">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                <Phone className="h-4 w-4" />
                {order.customer.phone}
              </p>
            </div>
            <div className="flex items-center gap-2 font-medium">
              {order.delivery_type === "delivery" ? (
                <MapPin className="h-4 w-4 text-brand" />
              ) : (
                <Store className="h-4 w-4 text-brand" />
              )}
              {order.delivery_type === "delivery" ? "Entrega" : "Retirada no local"}
            </div>
            {order.delivery_address ? (
              <p className="rounded-xl bg-[hsl(var(--muted))]/30 p-3 text-[hsl(var(--muted-foreground))]">
                {order.delivery_address.street}, {order.delivery_address.number}
                {order.delivery_address.complement ? ` — ${order.delivery_address.complement}` : ""}
                <br />
                {order.delivery_address.neighborhood} · {order.delivery_address.city}
              </p>
            ) : null}
            {order.notes ? (
              <UiHint tone="neutral" title="Observação do cliente">
                {order.notes}
              </UiHint>
            ) : null}
            {order.payment ? (
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4">
                <p className="font-medium">
                  {PAYMENT_LABELS[order.payment.method] ?? order.payment.method}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {order.payment.status === "paid" ? "Pago" : "Pendente"}
                  {order.payment.change_for
                    ? ` · Troco para R$ ${Number(order.payment.change_for).toFixed(2).replace(".", ",")}`
                    : ""}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
