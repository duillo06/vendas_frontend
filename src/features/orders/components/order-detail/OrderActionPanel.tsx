import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Armchair,
  Banknote,
  Check,
  Clock,
  FileText,
  Flame,
  MessageCircle,
  PackageCheck,
  Phone,
  Printer,
  ShoppingBag,
  Store,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { OrderStatus } from "@/features/checkout/types/checkout.types";
import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { OrderAlerts } from "@/features/orders/components/order-detail/OrderAlerts";
import { OrderProgressRail } from "@/features/orders/components/order-detail/OrderProgressRail";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { adminCopy } from "@/shared/copy/admin";
import { cn } from "@/shared/lib/utils";

import type { OrderAlert } from "./orderDetailHelpers";
import {
  formatElapsed,
  getPrimaryNextStatus,
  getSecondaryNextStatuses,
  getStatusEnteredAt,
  isDineInOrder,
  isMesaGuestPhone,
  minutesBetween,
  phoneDigits,
  pickPrimaryAlert,
  whatsappUrl,
} from "./orderDetailHelpers";
import {
  PAYMENT_METHOD_LABELS,
  SECONDARY_ACTION_LABELS,
  getLiveTimerCopy,
  getNowCardCopy,
  getPrimaryActionLabel,
} from "./orderDetailCopy";

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  pending: ShoppingBag,
  confirmed: Check,
  preparing: Flame,
  ready: PackageCheck,
  out_for_delivery: Truck,
  completed: Check,
  cancelled: Clock,
};

type OrderActionPanelProps = {
  order: OrderAdminDetail;
  now: number;
  alerts: OrderAlert[];
  isPending: boolean;
  paying: boolean;
  cancelNotes: string;
  canCancel: boolean;
  onCancelNotesChange: (value: string) => void;
  onAdvance: (status: OrderStatus) => void;
  onCancel: () => void;
  onMarkPaid: () => void;
  onPrintComanda: () => void;
};

export function OrderActionPanel({
  order,
  now,
  alerts,
  isPending,
  paying,
  cancelNotes,
  canCancel,
  onCancelNotesChange,
  onAdvance,
  onCancel,
  onMarkPaid,
  onPrintComanda,
}: OrderActionPanelProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const primary = getPrimaryNextStatus(order);
  const secondary = getSecondaryNextStatuses(order).filter((s) => s !== "cancelled");
  const minsInStatus = minutesBetween(getStatusEnteredAt(order), now);
  const totalMins = minutesBetween(new Date(order.created_at), now);
  const timer = getLiveTimerCopy(order, minsInStatus, totalMins);
  const copy = getNowCardCopy(order);
  const isMesa = isDineInOrder(order);
  const isPickupComplete = primary === "completed" && order.delivery_type !== "delivery";
  const PrimaryIcon = isPickupComplete
    ? isMesa
      ? Armchair
      : Store
    : primary
      ? STATUS_ICONS[primary]
      : Check;
  const urgent = order.status === "pending" && minsInStatus >= 10;
  const done = order.status === "completed" || order.status === "cancelled";
  const showContactActions = !isMesa && !isMesaGuestPhone(order.customer.phone);
  // um aviso só: atraso/pagamento vencem o "tudo ok"; se só success, cai no texto da ação
  const primaryAlert = pickPrimaryAlert(alerts);
  const cueAlert =
    primaryAlert && primaryAlert.tone !== "success" ? primaryAlert : null;

  return (
    <aside
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_-8px_rgb(0_0_0/0.14),0_2px_8px_-4px_rgb(0_0_0/0.06)] ring-1 ring-black/[0.05]",
        "lg:sticky lg:top-4",
        isMesa && "ring-teal-200/70",
        urgent && "ring-2 ring-amber-300/70",
      )}
    >
      {isMesa ? (
        <div className="flex items-center gap-2 border-b border-teal-200/70 bg-teal-50/90 px-4 py-2 text-xs font-semibold text-teal-900">
          <Armchair className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
          Mesa {order.table_number ?? "—"} · pagamento no local
        </div>
      ) : null}
      {/* status + timer */}
      <div
        className={cn(
          "relative space-y-2 border-b border-[hsl(var(--border))]/80 px-4 py-3.5",
          urgent && "bg-amber-50/60",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <OrderStatusBadge status={order.status} className="shadow-none" />
          <PriceDisplay value={order.total} className="text-lg font-semibold tabular-nums text-brand" />
        </div>

        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "relative mt-0.5 flex h-2.5 w-2.5 shrink-0",
              !done && "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-brand/35",
            )}
          >
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                urgent ? "bg-amber-500" : done ? "bg-[hsl(var(--muted-foreground))]" : "bg-brand",
              )}
            />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">{timer.label}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {timer.detail}
              {!done ? ` · total ${formatElapsed(totalMins).replace(/^há /, "")}` : null}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {cueAlert ? (
          <OrderAlerts alerts={[cueAlert]} />
        ) : (
          <p className="text-sm leading-snug text-[hsl(var(--muted-foreground))]">
            <span className="font-medium text-[hsl(var(--foreground))]">{copy.body}</span>
          </p>
        )}

        {/* CTA principal */}
        <AnimatePresence mode="wait">
          {primary ? (
            <motion.div
              key={primary}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              <Button
                type="button"
                size="lg"
                disabled={isPending}
                className={cn(
                  "h-12 w-full gap-2 text-base shadow-[var(--shadow-md)]",
                  isPickupComplete &&
                    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
                )}
                onClick={() => onAdvance(primary)}
              >
                <PrimaryIcon className="h-5 w-5" />
                {getPrimaryActionLabel(order, primary)}
              </Button>
              {secondary.length ? (
                <div className="flex flex-wrap gap-2">
                  {secondary.map((status) => {
                    const SecondaryIcon = STATUS_ICONS[status] ?? Check;
                    const isComplete = status === "completed";
                    return (
                      <Button
                        key={status}
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        className={cn(
                          "h-10 flex-1 gap-1.5 text-sm font-semibold",
                          isComplete &&
                            "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900",
                        )}
                        onClick={() => onAdvance(status)}
                      >
                        <SecondaryIcon className="h-4 w-4" />
                        {SECONDARY_ACTION_LABELS[status] ?? getPrimaryActionLabel(order, status)}
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-[hsl(var(--muted))]/50 px-3 py-2.5 text-sm text-[hsl(var(--muted-foreground))]"
            >
              {copy.emotion}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ações rápidas — mesa não tem WhatsApp/ligar */}
        <div
          className={cn(
            "grid gap-1 rounded-xl bg-[hsl(var(--muted))]/55 p-1",
            showContactActions ? "grid-cols-4" : "grid-cols-2",
          )}
          role="toolbar"
          aria-label="Ações rápidas"
        >
          {showContactActions ? (
            <>
              <a
                className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-brand hover:shadow-sm"
                href={`tel:${phoneDigits(order.customer.phone)}`}
              >
                <Phone className="h-4 w-4" />
                Ligar
              </a>
              <a
                className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-brand hover:shadow-sm"
                href={whatsappUrl(order.customer.phone)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </>
          ) : null}
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-brand hover:shadow-sm"
            onClick={onPrintComanda}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-white hover:text-brand hover:shadow-sm"
            onClick={onPrintComanda}
          >
            <FileText className="h-4 w-4" />
            2ª via
          </button>
        </div>

        <OrderProgressRail order={order} variant="compact" />

        {/* pagamento no painel de ação */}
        {order.payment ? (
          <div className="rounded-xl bg-[hsl(var(--muted))]/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Pagamento
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="min-w-0 text-sm">
                <p className="font-medium">
                  {PAYMENT_METHOD_LABELS[order.payment.method] ?? order.payment.method}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {order.payment.status === "paid" ? "Pago" : "Pendente"}
                  {order.payment.change_for ? (
                    <>
                      {" "}
                      · Troco <PriceDisplay value={order.payment.change_for} />
                    </>
                  ) : null}
                </p>
              </div>
              {order.payment.status === "pending" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 text-xs"
                  disabled={paying}
                  onClick={onMarkPaid}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  Registrar
                </Button>
              ) : (
                <span className="text-xs font-medium text-emerald-700">
                  {adminCopy.orders.detail.paymentPaid}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {canCancel ? (
          <div className="border-t border-[hsl(var(--border))]/80 pt-3">
            {!cancelOpen ? (
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 hover:text-red-800"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="h-4 w-4" />
                Cancelar pedido
              </button>
            ) : (
              <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-3">
                <p className="text-xs font-semibold text-red-800">Cancelar este pedido?</p>
                <Input
                  placeholder="Motivo do cancelamento (obrigatório)"
                  value={cancelNotes}
                  onChange={(e) => onCancelNotesChange(e.target.value)}
                  className="h-9 border-red-200 bg-white focus-visible:ring-red-400"
                />
                <p className="text-[11px] text-red-700/80">
                  {adminCopy.orders.detail.cancelHint}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 flex-1 gap-1.5 bg-red-600 text-xs text-white hover:bg-red-700 focus-visible:ring-red-500"
                    disabled={isPending || !cancelNotes.trim()}
                    onClick={onCancel}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Confirmar cancelamento
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      setCancelOpen(false);
                      onCancelNotesChange("");
                    }}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
