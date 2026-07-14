import type { ReactNode } from "react";
import { Banknote, Clock, Flame, MapPin, MessageCircle, Phone, Store, Timer } from "lucide-react";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { Button } from "@/shared/components/ui/button";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

import { PAYMENT_METHOD_LABELS, getLiveTimerCopy } from "./orderDetailCopy";
import {
  customerInitials,
  formatElapsed,
  getStatusEnteredAt,
  minutesBetween,
  phoneDigits,
  whatsappUrl,
} from "./orderDetailHelpers";

const linkBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-medium transition-[background-color,border-color,transform] duration-200 hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--muted))] active:scale-[0.98]";

function SideCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold tracking-wide text-[hsl(var(--muted-foreground))] uppercase">
        {title}
      </p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

type OrderSidePanelProps = {
  order: OrderAdminDetail;
  now: number;
  paying: boolean;
  onMarkPaid: () => void;
};

export function OrderSidePanel({ order, now, paying, onMarkPaid }: OrderSidePanelProps) {
  const minsInStatus = minutesBetween(getStatusEnteredAt(order), now);
  const totalMins = minutesBetween(new Date(order.created_at), now);
  const timer = getLiveTimerCopy(order, minsInStatus, totalMins);
  const address = order.delivery_address;

  return (
    <aside className="space-y-3">
      <SideCard title="Cliente">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-brand">
            {customerInitials(order.customer.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{order.customer.name}</p>
            <p className="truncate text-sm text-[hsl(var(--muted-foreground))]">{order.customer.phone}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <a className={linkBtn} href={`tel:${phoneDigits(order.customer.phone)}`}>
            <Phone className="h-3.5 w-3.5" />
            Ligar
          </a>
          <a
            className={linkBtn}
            href={whatsappUrl(order.customer.phone)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </SideCard>

      <SideCard title={order.delivery_type === "delivery" ? "Entrega" : "Retirada"}>
        <div className="flex items-start gap-2 text-sm">
          {order.delivery_type === "delivery" ? (
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          ) : (
            <Store className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          )}
          <div>
            {address ? (
              <p>
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ""}
                <br />
                <span className="text-[hsl(var(--muted-foreground))]">
                  {address.neighborhood} · {address.city}
                </span>
              </p>
            ) : (
              <p>Cliente retira no balcão</p>
            )}
          </div>
        </div>
      </SideCard>

      <SideCard title="Pagamento">
        {order.payment ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">
              {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
            </p>
            <p className="text-[hsl(var(--muted-foreground))]">
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
                className="mt-1 w-full gap-2"
                disabled={paying}
                onClick={onMarkPaid}
              >
                <Banknote className="h-4 w-4" />
                Registrar pagamento
              </Button>
            ) : (
              <p className="text-xs text-emerald-700">{adminCopy.orders.detail.paymentPaid}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Sem pagamento registrado</p>
        )}
      </SideCard>

      {order.notes ? (
        <SideCard title="Observações" className="border-amber-200/80 bg-amber-50/40">
          <p className="text-sm leading-relaxed text-amber-950">{order.notes}</p>
        </SideCard>
      ) : null}

      <SideCard title="Tempo">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Flame className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="font-medium">{timer.label}</p>
              <p className="text-[hsl(var(--muted-foreground))]">{timer.detail}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <div>
              <p className="font-medium">Desde a criação</p>
              <p className="text-[hsl(var(--muted-foreground))]">{formatElapsed(totalMins)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
            <div>
              <p className="font-medium">Tempo neste status</p>
              <p className="text-[hsl(var(--muted-foreground))]">
                {minsInStatus < 1 ? "instantes" : `${minsInStatus} min`}
              </p>
            </div>
          </div>
        </div>
      </SideCard>
    </aside>
  );
}
