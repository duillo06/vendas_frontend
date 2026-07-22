import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { MessageTicker } from "@/shared/components/MessageTicker";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { storefrontCopy } from "@/shared/copy/storefront";

import type { Order } from "@/features/checkout/types/checkout.types";

type OrderTrackingViewProps = {
  order: Order;
};

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  pending: "Recebemos seu pedido e em breve a loja vai confirmar.",
  confirmed: "Tudo certo — seu pedido já está na fila de preparo.",
  preparing: "Estamos preparando com cuidado. Falta pouco!",
  ready: "Seu pedido está pronto. Pode vir buscar ou aguardar a entrega.",
  out_for_delivery: "Saiu para entrega. Fique de olho no celular.",
  completed: "Pedido concluído. Esperamos que tenha gostado!",
  cancelled: "Este pedido foi cancelado. Se tiver dúvidas, fale com a loja.",
};

export function OrderTrackingView({ order }: OrderTrackingViewProps) {
  const statusMessage = STATUS_MESSAGES[order.status as OrderStatus];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
        {statusMessage ? (
          <MessageTicker messages={[`✨ ${statusMessage}`, storefrontCopy.order.tracking]} />
        ) : (
          <MessageTicker messages={[storefrontCopy.order.tracking]} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status do pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {order.status_history.map((entry, index) => (
              <li key={`${entry.status}-${entry.created_at}`} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    index === order.status_history.length - 1
                      ? "font-medium text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  }
                >
                  <OrderStatusBadge status={entry.status as OrderStatus} />
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(entry.created_at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2 text-sm">
              <div>
                <p className="font-medium">
                  {item.quantity}x {item.product_name}
                </p>
                {item.options.length > 0 ? (
                  <ul className="text-xs text-[hsl(var(--muted-foreground))]">
                    {item.options.map((opt) => (
                      <li key={`${opt.option_group_name}-${opt.option_name}`}>
                        {opt.option_group_name}: {opt.option_name}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <PriceDisplay value={item.total_price} />
            </div>
          ))}
          <div className="flex justify-between border-t border-[hsl(var(--border))] pt-3 font-semibold">
            <span>Total</span>
            <PriceDisplay value={order.total} className="text-[hsl(var(--primary))]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
