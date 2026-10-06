import { UserPlus, Users } from "lucide-react";

import type { DashboardCustomers } from "../types/dashboard.types";

type CustomerSplitCardProps = {
  customers: DashboardCustomers;
};

export function CustomerSplitCard({ customers }: CustomerSplitCardProps) {
  if (customers.total === 0) {
    return (
      <p className="py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Ainda sem clientes com pedido concluído neste período.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium">
        {customers.returning_pct >= customers.new_pct
          ? `${customers.returning_pct.toFixed(0)}% dos clientes já tinham pedido antes`
          : `${customers.new_pct.toFixed(0)}% são clientes novos no período`}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            <UserPlus className="h-3 w-3" />
            Novos
          </div>
          <p className="text-xl font-semibold tabular-nums">{customers.new}</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{customers.new_pct.toFixed(0)}%</p>
        </div>
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            <Users className="h-3 w-3" />
            Recorrentes
          </div>
          <p className="text-xl font-semibold tabular-nums">{customers.returning}</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {customers.returning_pct.toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full bg-brand"
          style={{ width: `${customers.new_pct}%` }}
          title="Novos"
        />
        <div
          className="h-full bg-[hsl(var(--chart-3))]"
          style={{ width: `${customers.returning_pct}%` }}
          title="Recorrentes"
        />
      </div>
    </div>
  );
}
