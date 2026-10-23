import { Armchair, Banknote, ChevronDown, MapPin, MessageSquareText, Store } from "lucide-react";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { OrderEventTimeline } from "@/features/orders/components/order-detail/OrderEventTimeline";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { cn } from "@/shared/lib/utils";

import { PAYMENT_METHOD_LABELS } from "./orderDetailCopy";
import { isDineInOrder } from "./orderDetailHelpers";
import { formatCompositionLabel, CompositionHighlight } from "@/features/cart";

/** tom do cabeçalho da comanda (sem moldura colorida) */
const STATUS_HEADER: Record<
  OrderStatus,
  { from: string; border: string; label: string }
> = {
  pending: {
    from: "from-amber-500/[0.08]",
    border: "border-amber-200/50",
    label: "text-amber-700",
  },
  confirmed: {
    from: "from-blue-500/[0.08]",
    border: "border-blue-200/50",
    label: "text-blue-700",
  },
  preparing: {
    from: "from-orange-500/[0.08]",
    border: "border-orange-200/50",
    label: "text-orange-700",
  },
  ready: {
    from: "from-emerald-500/[0.08]",
    border: "border-emerald-200/50",
    label: "text-emerald-700",
  },
  out_for_delivery: {
    from: "from-blue-500/[0.08]",
    border: "border-blue-200/50",
    label: "text-blue-700",
  },
  completed: {
    from: "from-green-500/[0.06]",
    border: "border-green-200/50",
    label: "text-green-700",
  },
  cancelled: {
    from: "from-red-500/[0.06]",
    border: "border-red-200/50",
    label: "text-red-700",
  },
};

type OrderItemsPanelProps = {
  order: OrderAdminDetail;
};

export function OrderItemsPanel({ order }: OrderItemsPanelProps) {
  const address = order.delivery_address;
  const isDelivery = order.delivery_type === "delivery";
  const isMesa = isDineInOrder(order);
  const paymentMethodLabel = order.payment
    ? (PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method)
    : null;
  const paymentPending = order.payment?.status === "pending";
  const hasOrderNotes = Boolean(order.notes?.trim());
  const hasInternalNotes = Boolean(order.internal_notes?.trim());
  const frame = STATUS_HEADER[order.status as OrderStatus] ?? STATUS_HEADER.pending;
  const channelLabel = isDelivery ? "Entrega" : isMesa ? "Mesa" : "Retirada";

  return (
    <div className="space-y-3">
      {/* comanda — o coração do pedido */}
      <section
        className={cn(
          "overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_-8px_rgb(0_0_0/0.14)] ring-1 ring-black/[0.05]",
          isMesa && "ring-teal-200/80",
        )}
      >
        {isMesa ? (
          <div className="flex items-center gap-2.5 border-b border-teal-200/70 bg-teal-50/90 px-4 py-2.5 sm:px-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm shadow-teal-600/20">
              <Armchair className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-teal-800">
                Pedido na mesa
              </p>
              <p className="text-sm font-semibold text-teal-950">
                Mesa {order.table_number ?? "—"}
                <span className="font-normal text-teal-800/80"> · levar até o cliente</span>
              </p>
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-b bg-gradient-to-r to-transparent px-4 py-3.5 sm:px-5",
            frame.border,
            frame.from,
          )}
        >
          <div className="min-w-0">
            <p className={cn("text-[10px] font-semibold uppercase tracking-wide", frame.label)}>
              Pedido
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground)/0.88)] sm:text-xl">
              {order.order_number}
            </h2>
            <p className="mt-0.5 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
              {order.items.length} {order.items.length === 1 ? "item" : "itens"}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ring-1 ring-inset",
                isDelivery
                  ? "bg-sky-50 text-sky-800 ring-sky-200"
                  : isMesa
                    ? "bg-teal-50 text-teal-900 ring-teal-200"
                    : "bg-violet-50 text-violet-800 ring-violet-200",
              )}
            >
              {isDelivery ? (
                <MapPin className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : isMesa ? (
                <Armchair className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : (
                <Store className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
              {channelLabel}
            </span>
            {paymentMethodLabel ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ring-1 ring-inset",
                  paymentPending
                    ? "bg-amber-50 text-amber-900 ring-amber-200"
                    : "bg-emerald-50 text-emerald-800 ring-emerald-200",
                )}
              >
                <Banknote className="h-3.5 w-3.5" strokeWidth={2.25} />
                {paymentMethodLabel}
                {paymentPending ? " · pendente" : ""}
              </span>
            ) : null}
          </div>
        </div>

        {(hasOrderNotes || hasInternalNotes) && (
          <div className="space-y-2 border-b border-[hsl(var(--border))]/70 bg-amber-50/90 px-4 py-3.5 sm:px-5">
            {hasOrderNotes ? (
              <div className="flex gap-2.5">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Observação do cliente
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-amber-950">
                    {order.notes}
                  </p>
                </div>
              </div>
            ) : null}
            {hasInternalNotes ? (
              <div className="flex gap-2.5">
                <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Obs. da loja
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-amber-950">
                    {order.internal_notes}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <ul className="divide-y divide-[hsl(var(--border))]/60">
          {order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </ul>

        <div className="space-y-2 border-t border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 px-4 py-4 sm:px-5">
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
            <PriceDisplay value={order.subtotal} className="tabular-nums" />
          </div>
          {order.delivery_fee > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Entrega</span>
              <PriceDisplay value={order.delivery_fee} className="tabular-nums" />
            </div>
          ) : null}
          {order.discount > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--muted-foreground))]">Desconto</span>
              <span className="tabular-nums text-emerald-700">
                − <PriceDisplay value={order.discount} />
              </span>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-[hsl(var(--border))]/60 pt-2.5">
            <span className="text-sm font-semibold text-[hsl(var(--foreground)/0.8)]">Total</span>
            <PriceDisplay
              value={order.total}
              className="text-xl font-semibold tabular-nums text-brand"
            />
          </div>
        </div>
      </section>

      {order.delivery_type === "delivery" && address ? (
        <div className="rounded-2xl bg-white px-4 py-3.5 shadow-[0_2px_16px_-6px_rgb(0_0_0/0.12)] ring-1 ring-black/[0.04]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/12 text-brand">
              <MapPin className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand">
                Endereço de entrega
              </p>
              <p className="mt-0.5 text-base font-bold tracking-tight sm:text-lg">
                {address.street}
                {address.number ? (
                  <span className="text-brand">, {address.number}</span>
                ) : null}
              </p>
              {address.neighborhood ? (
                <p className="mt-0.5 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {address.neighborhood}
                </p>
              ) : null}
              <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                {[address.complement, address.city, address.state].filter(Boolean).join(" · ")}
                {address.reference ? (
                  <>
                    <br />
                    Ref: {address.reference}
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <details open className="group rounded-2xl bg-white shadow-[0_2px_12px_-6px_rgb(0_0_0/0.1)] ring-1 ring-black/[0.04] open:pb-3">
        <summary className="cursor-pointer list-none px-3.5 py-3 text-xs font-semibold text-[hsl(var(--foreground))] marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="inline-flex w-full items-center justify-between gap-1.5">
            Histórico do pedido
            <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] transition group-open:rotate-180" />
          </span>
        </summary>
        <div className="px-3.5 pt-0.5">
          <OrderEventTimeline order={order} embedded />
        </div>
      </details>
    </div>
  );
}

type Item = OrderAdminDetail["items"][number];

function OrderItemRow({ item }: { item: Item }) {
  const hasOptions = item.options.length > 0;
  const hasNotes = Boolean(item.notes?.trim());
  const composition = formatCompositionLabel(
    item.product_name,
    (item.components ?? []).map((c) => c.product_name),
  );

  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-brand px-1.5 text-[11px] font-bold tabular-nums text-[hsl(var(--primary-foreground))] shadow-sm shadow-brand/20">
              {item.quantity}×
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug tracking-tight text-[hsl(var(--foreground)/0.88)] sm:text-[15px]">
                {item.product_name}
              </p>
              {composition ? <CompositionHighlight label={composition} /> : null}
            </div>
          </div>

          {hasOptions ? (
            <ul className="mt-2.5 space-y-1.5 border-l-2 border-brand/20 pl-3">
              {item.options.map((opt) => (
                <li
                  key={`${opt.option_group_name}-${opt.option_name}`}
                  className="text-[13px] leading-snug text-[hsl(var(--foreground)/0.75)]"
                >
                  <span className="font-medium text-[hsl(var(--muted-foreground))]">
                    {opt.option_group_name}:
                  </span>{" "}
                  <span className="font-medium">{opt.option_name}</span>
                  {opt.price_modifier > 0 ? (
                    <span className="ml-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      (+
                      <PriceDisplay value={opt.price_modifier} />)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {hasNotes ? (
            <div className="mt-2.5 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200/70">
              <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
              <p className="text-sm font-medium leading-snug text-amber-950">
                <span className="font-semibold">Obs:</span> {item.notes}
              </p>
            </div>
          ) : null}
        </div>

        <PriceDisplay
          value={item.total_price}
          className="shrink-0 text-sm font-semibold tabular-nums text-[hsl(var(--foreground)/0.8)] sm:text-[15px]"
        />
      </div>
    </li>
  );
}
