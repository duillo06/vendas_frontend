import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { cn } from "@/shared/lib/utils";

type OrderItemsPanelProps = {
  order: OrderAdminDetail;
};

export function OrderItemsPanel({ order }: OrderItemsPanelProps) {
  return (
    <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-sm)] md:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] text-brand">
          <Package className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Itens do pedido</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {order.items.length} {order.items.length === 1 ? "item" : "itens"}
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {order.items.map((item, index) => (
          <OrderItemCard key={item.id} item={item} delayIndex={index} />
        ))}
      </ul>

      <div className="mt-5 space-y-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
          <PriceDisplay value={order.subtotal} />
        </div>
        {order.delivery_fee > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-[hsl(var(--muted-foreground))]">Entrega</span>
            <PriceDisplay value={order.delivery_fee} />
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
        <div className="flex items-end justify-between border-t border-[hsl(var(--border))] pt-3">
          <span className="text-sm font-semibold">Total</span>
          <PriceDisplay value={order.total} className="type-value text-brand" />
        </div>
      </div>
    </section>
  );
}

type Item = OrderAdminDetail["items"][number];

function OrderItemCard({ item, delayIndex }: { item: Item; delayIndex: number }) {
  const [open, setOpen] = useState(Boolean(item.notes) || item.options.length > 2);
  const hasDetails = item.options.length > 0 || Boolean(item.notes);

  return (
    <li
      className="rounded-xl border border-[hsl(var(--border))] bg-white p-3.5 transition-shadow duration-200 hover:shadow-[var(--shadow-sm)] animate-fade-up"
      style={{ animationDelay: `${Math.min(delayIndex, 6) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-[hsl(var(--muted))] px-1.5 text-xs font-bold tabular-nums">
              {item.quantity}×
            </span>
            <p className="font-semibold leading-snug">{item.product_name}</p>
          </div>
          {!open && item.options.length > 0 ? (
            <p className="mt-1 truncate text-xs text-[hsl(var(--muted-foreground))]">
              {item.options
                .slice(0, 2)
                .map((opt) => opt.option_name)
                .join(" · ")}
              {item.options.length > 2 ? "…" : ""}
            </p>
          ) : null}
        </div>
        <PriceDisplay value={item.total_price} className="shrink-0 font-semibold" />
      </div>

      {hasDetails ? (
        <>
          <button
            type="button"
            className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-medium text-brand"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Ocultar detalhes" : "Expandir detalhes"}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
          </button>

          {open ? (
            <div className="mt-2 space-y-2 border-t border-[hsl(var(--border))] pt-2">
              {item.options.length ? (
                <ul className="space-y-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {item.options.map((opt) => (
                    <li key={`${opt.option_group_name}-${opt.option_name}`}>
                      <span className="font-medium text-[hsl(var(--foreground)/0.75)]">
                        {opt.option_group_name}:
                      </span>{" "}
                      {opt.option_name}
                      {opt.price_modifier > 0 ? (
                        <>
                          {" "}
                          (+
                          <PriceDisplay value={opt.price_modifier} />)
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.notes ? (
                <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-xs text-amber-950">
                  <span className="font-semibold">Obs:</span> {item.notes}
                </p>
              ) : null}
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Unitário <PriceDisplay value={item.unit_price} />
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </li>
  );
}
