import { useEffect, useMemo, useState } from "react";
import { Armchair, Bike, CalendarRange, ClipboardList, Search, Store } from "lucide-react";
import { useSearchParams } from "react-router";

import { useOrders } from "@/features/orders/hooks/useOrders";
import { EmptyState } from "@/shared/components/EmptyState";
import {
  AdminOrderCard,
  AdminPagination,
  BackLink,
  PageHeader,
} from "@/shared/components/visual";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ADMIN_PAGE_SIZE } from "@/shared/constants/adminList";
import { adminCopy } from "@/shared/copy/admin";
import type { OrderStatus } from "@/shared/components/OrderStatusBadge";
import { cn } from "@/shared/lib/utils";

type DatePeriod = "today" | "7d" | "30d" | "custom";

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "confirmed,preparing,ready,out_for_delivery", label: "Em andamento" },
  { value: "completed", label: "Concluídos" },
  { value: "cancelled", label: "Cancelados" },
];

const PERIOD_PRESETS: Array<{ value: Exclude<DatePeriod, "custom">; label: string }> = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
];

const DELIVERY_OPTIONS: Array<{
  value: string;
  label: string;
  icon?: typeof Bike;
}> = [
  { value: "", label: "Todos" },
  { value: "delivery", label: "Entrega", icon: Bike },
  { value: "pickup", label: "Retirada", icon: Store },
  { value: "dine_in", label: "Mesas", icon: Armchair },
];

function todayIso() {
  const d = new Date();
  return toIsoDate(d);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toIsoDate(d);
}

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangeForPeriod(period: Exclude<DatePeriod, "custom">): { from: string; to: string } {
  const to = todayIso();
  if (period === "today") return { from: to, to };
  if (period === "7d") return { from: daysAgoIso(6), to };
  return { from: daysAgoIso(29), to };
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";
  const [status, setStatus] = useState(
    STATUS_TABS.some((tab) => tab.value === initialStatus) ? initialStatus : "",
  );
  const [deliveryType, setDeliveryType] = useState("");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [period, setPeriod] = useState<DatePeriod>("today");
  const [rangeFrom, setRangeFrom] = useState(() => todayIso());
  const [rangeTo, setRangeTo] = useState(() => todayIso());
  const [page, setPage] = useState(1);

  const dateRange = useMemo(() => {
    if (period === "custom") {
      if (!rangeFrom || !rangeTo) return null;
      return { from: rangeFrom, to: rangeTo };
    }
    return rangeForPeriod(period);
  }, [period, rangeFrom, rangeTo]);

  useEffect(() => {
    setPage(1);
  }, [status, deliveryType, search, activeOnly, period, rangeFrom, rangeTo]);

  const { data, isLoading } = useOrders(
    {
      status: status || undefined,
      delivery_type: deliveryType || undefined,
      search: search || undefined,
      active: activeOnly,
      created_after: dateRange?.from,
      created_before: dateRange?.to,
      page,
      page_size: ADMIN_PAGE_SIZE,
    },
    { polling: true },
  );

  const hasFilters = Boolean(
    status || deliveryType || search.trim() || activeOnly || period !== "today",
  );
  const orders = data?.results ?? [];
  const total = data?.count ?? 0;
  const customActive = period === "custom";

  function applyPreset(next: Exclude<DatePeriod, "custom">) {
    const range = rangeForPeriod(next);
    setPeriod(next);
    setRangeFrom(range.from);
    setRangeTo(range.to);
  }

  function applyCustom(from: string, to: string) {
    setRangeFrom(from);
    setRangeTo(to);
    if (from && to) setPeriod("custom");
  }

  return (
    <div className="space-y-4">
      <BackLink to="/" label="Dashboard" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Pedidos" subtitle={adminCopy.orders.subtitle} icon={ClipboardList} />
        <div className="flex items-center gap-2 pb-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Ao vivo
          {!isLoading && total > 0 ? (
            <span className="tabular-nums text-[hsl(var(--foreground))]">· {total}</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-0 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
          <nav
            className="-mx-1 flex min-w-0 flex-1 gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Filtrar por status"
          >
            {STATUS_TABS.map((tab) => {
              const active = status === tab.value;
              return (
                <button
                  key={tab.value || "all"}
                  type="button"
                  onClick={() => setStatus(tab.value)}
                  className={cn(
                    "relative shrink-0 px-2.5 py-2 text-xs font-medium transition-colors sm:text-[13px]",
                    active
                      ? "text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                  )}
                >
                  {tab.label}
                  {active ? (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* período à direita */}
          <div
            className={cn(
              "mb-1.5 flex shrink-0 flex-col gap-1.5 rounded-xl bg-[hsl(var(--muted))]/50 p-1 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-[hsl(var(--border))/80]",
            )}
          >
            <div
              className="flex gap-0.5 overflow-x-auto p-0.5 sm:pr-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Período"
            >
              {PERIOD_PRESETS.map((opt) => {
                const active = !customActive && period === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => applyPreset(opt.value)}
                    className={cn(
                      "h-7 shrink-0 rounded-md px-2.5 text-[10px] font-medium transition-colors sm:text-[11px]",
                      active
                        ? "bg-white text-[hsl(var(--foreground))] shadow-sm"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div
              className={cn(
                "flex min-w-0 items-center gap-1 rounded-lg px-1.5 py-0.5 sm:pl-2",
                customActive && "bg-white/90",
              )}
            >
              <CalendarRange
                className={cn(
                  "hidden h-3.5 w-3.5 shrink-0 md:block",
                  customActive ? "text-brand" : "text-[hsl(var(--muted-foreground))]",
                )}
                aria-hidden
              />
              <label className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                <span className="sr-only sm:not-sr-only sm:shrink-0">De</span>
                <Input
                  type="date"
                  value={rangeFrom}
                  max={rangeTo || undefined}
                  onChange={(e) => applyCustom(e.target.value, rangeTo || e.target.value)}
                  className={cn(
                    "h-7 w-[7.75rem] border-0 bg-transparent px-0.5 text-[11px] shadow-none focus-visible:ring-1 sm:w-[8.5rem]",
                    customActive && "text-[hsl(var(--foreground))]",
                  )}
                />
              </label>
              <span className="shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden>
                →
              </span>
              <label className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                <span className="sr-only sm:not-sr-only sm:shrink-0">Até</span>
                <Input
                  type="date"
                  value={rangeTo}
                  min={rangeFrom || undefined}
                  onChange={(e) => applyCustom(rangeFrom || e.target.value, e.target.value)}
                  className={cn(
                    "h-7 w-[7.75rem] border-0 bg-transparent px-0.5 text-[11px] shadow-none focus-visible:ring-1 sm:w-[8.5rem]",
                    customActive && "text-[hsl(var(--foreground))]",
                  )}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <label className="group relative flex min-w-0 flex-1 items-center sm:max-w-sm">
            <Search className="pointer-events-none absolute left-0 h-4 w-4 text-[hsl(var(--muted-foreground))] transition group-focus-within:text-brand" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar número, nome ou telefone…"
              aria-label="Buscar pedidos"
              className={cn(
                "h-9 w-full border-0 border-b border-transparent bg-transparent pl-7 pr-2 text-sm outline-none transition",
                "placeholder:text-[hsl(var(--muted-foreground))]",
                "focus:border-brand/40",
              )}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg bg-[hsl(var(--muted))]/70 p-0.5"
              role="group"
              aria-label="Tipo de pedido"
            >
              {DELIVERY_OPTIONS.map((opt) => {
                const active = deliveryType === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value || "all-types"}
                    type="button"
                    onClick={() => setDeliveryType(opt.value)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition",
                      active
                        ? "bg-white text-[hsl(var(--foreground))] shadow-sm"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={activeOnly}
              onClick={() => setActiveOnly((v) => !v)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium transition",
                activeOnly
                  ? "bg-brand/10 text-brand"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              <span
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors",
                  activeOnly ? "bg-brand" : "bg-[hsl(var(--border))]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-[left]",
                    activeOnly ? "left-3.5" : "left-0.5",
                  )}
                />
              </span>
              Só ativos
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04]">
          <Skeleton className="h-12 w-full rounded-none" />
          <Skeleton className="h-12 w-full rounded-none border-t border-[hsl(var(--border))]" />
          <Skeleton className="h-12 w-full rounded-none border-t border-[hsl(var(--border))]" />
        </div>
      ) : orders.length ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/[0.04]">
            <ul className="divide-y divide-[hsl(var(--border))]/80">
              {orders.map((order) => (
                <li key={order.id}>
                  <AdminOrderCard
                    id={order.id}
                    orderNumber={order.order_number}
                    customerName={order.customer_name}
                    createdAt={formatDateTime(order.created_at)}
                    status={order.status as OrderStatus}
                    total={order.total}
                    itemsCount={order.items_count}
                    deliveryType={order.delivery_type as "delivery" | "pickup" | "dine_in"}
                    tableNumber={order.table_number}
                  />
                </li>
              ))}
            </ul>
          </div>
          <AdminPagination page={page} total={total} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={adminCopy.orders.empty.title}
          description={hasFilters ? adminCopy.orders.empty.filtered : adminCopy.orders.empty.waiting}
          accent="chart-3"
        />
      )}
    </div>
  );
}
