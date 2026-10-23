import { Armchair, ChevronLeft, Phone } from "lucide-react";
import { Link } from "react-router";

import type { OrderAdminDetail } from "@/features/orders/types/order-admin.types";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { formatPhoneMask, phoneDigits } from "@/shared/lib/phone";

import {
  customerInitials,
  formatDayTime,
  isDineInOrder,
  isMesaGuestPhone,
} from "./orderDetailHelpers";

type OrderHeroHeaderProps = {
  order: OrderAdminDetail;
};

/** header numa linha — cliente · telefone · status (mesa = número em destaque) */
export function OrderHeroHeader({ order }: OrderHeroHeaderProps) {
  const isMesa = isDineInOrder(order);
  const phoneDisplay = formatPhoneMask(order.customer.phone);
  const phoneHref = phoneDigits(order.customer.phone);
  const showPhone = !isMesa && !isMesaGuestPhone(order.customer.phone);
  const mesaNumber = order.table_number?.trim() || "—";

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
        <Link
          to="/pedidos"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Pedidos
        </Link>
        <span className="shrink-0 text-[hsl(var(--border))]" aria-hidden>
          /
        </span>

        {isMesa ? (
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-teal-600 px-2.5 text-[11px] font-bold text-white shadow-sm shadow-teal-600/25">
            <Armchair className="h-3.5 w-3.5" strokeWidth={2.25} />
            Mesa {mesaNumber}
          </span>
        ) : (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-[hsl(var(--primary-foreground))]">
            {customerInitials(order.customer.name)}
          </span>
        )}

        <h1 className="truncate text-base font-semibold leading-none tracking-tight sm:text-lg">
          {isMesa ? "No local" : order.customer.name}
        </h1>

        {showPhone ? (
          <>
            <span className="hidden h-3.5 w-px shrink-0 bg-[hsl(var(--border))] sm:block" aria-hidden />
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium leading-none text-[hsl(var(--muted-foreground))] transition hover:text-brand"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="tabular-nums">{phoneDisplay}</span>
            </a>
          </>
        ) : null}

        <OrderStatusBadge status={order.status} className="shrink-0 gap-1 px-1.5 py-0.5 text-[10px] shadow-none" />
      </div>

      <p className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
        {formatDayTime(order.created_at)}
      </p>
    </header>
  );
}
