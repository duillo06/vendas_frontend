import type { ReactNode } from "react";
import { Armchair, Banknote, Clock, Flame, MapPin, Store, Timer } from "lucide-react";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { Button } from "@/shared/components/ui/button";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { adminCopy } from "@/shared/copy/admin";

import { PAYMENT_METHOD_LABELS, getLiveTimerCopy } from "./orderDetailCopy";
import {
  customerInitials,
  formatElapsed,
  getStatusEnteredAt,
  isDineInOrder,
  isMesaGuestPhone,
  minutesBetween,
} from "./orderDetailHelpers";

type OrderSidePanelProps = {
  order: OrderAdminDetail;
  now: number;
  paying: boolean;
  onMarkPaid: () => void;
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        {title}
      </p>
      {children}
    </div>
  );
}

export function OrderSidePanel({ order, now, paying, onMarkPaid }: OrderSidePanelProps) {
  const minsInStatus = minutesBetween(getStatusEnteredAt(order), now);
  const totalMins = minutesBetween(new Date(order.created_at), now);
  const timer = getLiveTimerCopy(order, minsInStatus, totalMins);
  const address = order.delivery_address;
  const isMesa = isDineInOrder(order);
  const showPhone = !isMesaGuestPhone(order.customer.phone);

  return (
    <aside
      className={
        isMesa
          ? "space-y-4 rounded-xl bg-white p-4 ring-1 ring-teal-200/80"
          : "space-y-4 rounded-xl bg-white p-4 ring-1 ring-black/[0.04]"
      }
    >
      <Section title={isMesa ? "Mesa" : "Cliente"}>
        <div className="flex items-center gap-2.5">
          <span
            className={
              isMesa
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
            }
          >
            {isMesa ? (
              <Armchair className="h-4 w-4" strokeWidth={2.25} />
            ) : (
              customerInitials(order.customer.name)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {isMesa ? `Mesa ${order.table_number ?? "—"}` : order.customer.name}
            </p>
            {showPhone ? (
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                {order.customer.phone}
              </p>
            ) : (
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">Cliente no local</p>
            )}
          </div>
        </div>
      </Section>

      <Section
        title={
          order.delivery_type === "delivery"
            ? "Entrega"
            : isMesa
              ? "Atendimento"
              : "Retirada"
        }
      >
        <div className="flex items-start gap-2 text-sm">
          {order.delivery_type === "delivery" ? (
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          ) : isMesa ? (
            <Armchair className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
          ) : (
            <Store className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
          )}
          <div className="min-w-0 text-sm leading-snug">
            {isMesa ? (
              <p className="text-sm font-semibold">
                Mesa {order.table_number ?? "—"}
                <span className="mt-0.5 block text-xs font-normal text-[hsl(var(--muted-foreground))]">
                  Levar o pedido até a mesa
                </span>
              </p>
            ) : address ? (
              <p>
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ""}
                <br />
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {address.neighborhood} · {address.city}
                </span>
              </p>
            ) : (
              <p className="text-sm">Cliente retira no balcão</p>
            )}
          </div>
        </div>
      </Section>

      <Section title="Pagamento">
        {order.payment ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">
              {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {order.payment.status === "paid" ? "Pago" : "Pendente"}
              {order.payment.change_for ? (
                <>
                  {" "}
                  · Troco para <PriceDisplay value={order.payment.change_for} />
                </>
              ) : null}
            </p>
            {order.payment.status === "pending" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full gap-1.5 text-xs"
                disabled={paying}
                onClick={onMarkPaid}
              >
                <Banknote className="h-3.5 w-3.5" />
                Registrar pagamento
              </Button>
            ) : (
              <p className="text-xs text-emerald-700">{adminCopy.orders.detail.paymentPaid}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Sem pagamento registrado</p>
        )}
      </Section>

      {order.notes ? (
        <Section title="Observações">
          <p className="rounded-lg bg-amber-50 px-2.5 py-2 text-xs leading-relaxed text-amber-950">
            {order.notes}
          </p>
        </Section>
      ) : null}

      <Section title="Tempo">
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            <div>
              <p className="font-medium text-sm">{timer.label}</p>
              <p className="text-[hsl(var(--muted-foreground))]">{timer.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
            <Timer className="h-3.5 w-3.5 shrink-0" />
            <span>Desde a criação · {formatElapsed(totalMins)}</span>
          </div>
          <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Neste status · {minsInStatus < 1 ? "instantes" : `${minsInStatus} min`}
            </span>
          </div>
        </div>
      </Section>
    </aside>
  );
}
