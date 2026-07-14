import { useEffect, useState } from "react";
import { ClipboardList, LayoutDashboard, RefreshCw, ShoppingBag, TrendingUp, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { useDashboard } from "@/features/dashboard";
import { FlowEmptyState } from "@/features/flow/FlowEmptyState";
import { FlowOnboarding } from "@/features/flow/FlowOnboarding";
import { useFlowOnboarding } from "@/features/flow/useFlowOnboarding";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { UiHint } from "@/shared/components/UiHint";
import { AdminOrderCard, PageHeader, StatCard } from "@/shared/components/visual";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { adminCopy } from "@/shared/copy/admin";
import type { OrderStatus } from "@/shared/components/OrderStatusBadge";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const navigate = useNavigate();
  const onboarding = useFlowOnboarding();
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const pendingOrders = data?.today.pending_orders ?? 0;
  const totalOrders = data?.today.total_orders ?? 0;
  const progressPercent = totalOrders > 0 ? Math.round(((totalOrders - pendingOrders) / totalOrders) * 100) : 0;

  return (
    <div className="space-y-8">
      <FlowOnboarding
        open={onboarding.open}
        onClose={onboarding.dismiss}
        onStart={() => {
          onboarding.dismiss();
          navigate("/produtos/novo");
        }}
      />

      <PageHeader
        variant="hero"
        title="Dashboard"
        subtitle={adminCopy.dashboard.subtitle(greeting)}
        icon={LayoutDashboard}
        action={
          <Link to="/pedidos">
            <Button size="lg" className="gap-2 bg-white text-brand shadow-lg hover:bg-[hsl(var(--primary-soft))]">
              <ShoppingBag className="h-4 w-4" />
              Ver pedidos
            </Button>
          </Link>
        }
      />

      {isError ? (
        <p className="text-sm text-red-600">Não foi possível carregar o dashboard.</p>
      ) : null}

      <UiHint icon={RefreshCw} tone="info">
        {adminCopy.dashboard.guidance}
      </UiHint>

      {!isLoading && pendingOrders > 0 ? (
        <UiHint icon={ClipboardList} tone="warm" title="Atenção">
          {adminCopy.dashboard.pendingAlert(pendingOrders)}
          <Link to="/pedidos?status=pending" className="ml-1 font-medium text-brand underline">
            Ver pendentes
          </Link>
        </UiHint>
      ) : null}

      {!isLoading && totalOrders > 0 ? (
        <div className="glass-panel rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{adminCopy.dashboard.progressLabel}</span>
            <span className="text-[hsl(var(--muted-foreground))]">
              {totalOrders - pendingOrders}/{totalOrders} em andamento
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pedidos hoje"
          icon={ShoppingBag}
          accent="chart-1"
          highlight={pendingOrders > 0}
          value={isLoading ? <Skeleton className="h-9 w-16" /> : totalOrders}
          hint={
            isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <>
                {pendingOrders} pendentes · {data?.today.preparing_orders ?? 0} em preparo
                <p className="mt-1">{adminCopy.dashboard.metrics.ordersToday}</p>
              </>
            )
          }
        />
        <StatCard
          label="Faturamento"
          icon={TrendingUp}
          accent="chart-3"
          highlight
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

      <Card className="overflow-hidden border-brand-soft/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-[hsl(var(--border))] bg-brand-soft/30">
          <CardTitle className="text-base">Pedidos recentes</CardTitle>
          <Link to="/pedidos">
            <Button type="button" variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : data?.recent_orders.length ? (
            <ul className="space-y-3">
              {data.recent_orders.map((order) => (
                <li key={order.id}>
                  <AdminOrderCard
                    id={order.id}
                    orderNumber={order.order_number}
                    customerName={order.customer_name}
                    createdAt={formatTime(order.created_at)}
                    status={order.status as OrderStatus}
                    total={order.total}
                    compact
                  />
                </li>
              ))}
            </ul>
          ) : (
            <FlowEmptyState
              line={{
                emoji: "🌱",
                title: adminCopy.dashboard.emptyOrders.title,
                text: adminCopy.dashboard.emptyOrders.description,
                mood: "idle",
              }}
              action={
                <Button type="button" onClick={() => navigate("/produtos/novo")} className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Criar meu primeiro produto
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
