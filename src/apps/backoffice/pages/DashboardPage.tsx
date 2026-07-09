import { useEffect, useState } from "react";
import { ClipboardList, LayoutDashboard, RefreshCw, ShoppingBag, TrendingUp, XCircle } from "lucide-react";
import { Link } from "react-router";

import { useDashboard } from "@/features/dashboard";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { OrderStatusBadge, type OrderStatus } from "@/shared/components/OrderStatusBadge";
import { UiHint } from "@/shared/components/UiHint";
import { PageHeader, StatCard } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const pendingOrders = data?.today.pending_orders ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={adminCopy.dashboard.subtitle(greeting)}
        icon={LayoutDashboard}
        accent="chart-1"
      />

      {isError ? (
        <p className="text-sm text-red-600">Não foi possível carregar o dashboard.</p>
      ) : null}

      <UiHint icon={RefreshCw} tone="info">
        {adminCopy.dashboard.guidance}
      </UiHint>

      {!isLoading && pendingOrders > 0 ? (
        <UiHint icon={ClipboardList} tone="warm">
          {adminCopy.dashboard.pendingAlert(pendingOrders)}
          <Link to="/pedidos?status=pending" className="ml-1 font-medium text-brand underline">
            Ver pendentes
          </Link>
        </UiHint>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pedidos hoje"
          icon={ShoppingBag}
          accent="chart-1"
          value={isLoading ? <Skeleton className="h-9 w-16" /> : (data?.today.total_orders ?? 0)}
          hint={
            isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <>
                {data?.today.pending_orders ?? 0} pendentes · {data?.today.preparing_orders ?? 0} em preparo
                <p className="mt-1">{adminCopy.dashboard.metrics.ordersToday}</p>
              </>
            )
          }
        />
        <StatCard
          label="Faturamento"
          icon={TrendingUp}
          accent="chart-3"
          value={
            isLoading ? <Skeleton className="h-9 w-28" /> : <PriceDisplay value={data?.today.revenue ?? 0} />
          }
          hint={
            isLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <>
                {data?.today.completed_orders ?? 0} concluídos
                <p className="mt-1">{adminCopy.dashboard.metrics.revenue}</p>
              </>
            )
          }
        />
        <StatCard
          label="Ticket médio"
          icon={TrendingUp}
          accent="chart-4"
          value={
            isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <PriceDisplay value={data?.today.average_ticket ?? 0} />
            )
          }
          hint={adminCopy.dashboard.metrics.ticket}
        />
        <StatCard
          label="Cancelados"
          icon={XCircle}
          accent="chart-2"
          value={isLoading ? <Skeleton className="h-9 w-12" /> : (data?.today.cancelled_orders ?? 0)}
          hint={adminCopy.dashboard.metrics.cancelled}
        />
      </div>

      <Card className="interactive-card">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
          <Link to="/pedidos">
            <Button type="button" variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : data?.recent_orders.length ? (
            <ul className="divide-y divide-[hsl(var(--border))]">
              {data.recent_orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/pedidos/${order.id}`}
                    className="flex flex-col gap-2 rounded-lg py-3 transition-colors hover:bg-brand-soft/50 sm:flex-row sm:items-center sm:justify-between sm:px-2"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {order.order_number} — {order.customer_name}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatTime(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                      <PriceDisplay value={order.total} className="font-semibold" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-brand-soft bg-brand-soft/40 px-4 py-10 text-center">
              <p className="font-medium">{adminCopy.dashboard.emptyOrders.title}</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                {adminCopy.dashboard.emptyOrders.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
