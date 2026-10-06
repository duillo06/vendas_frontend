import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/shared/lib/utils";
import { formatCurrency } from "@/shared/lib/format";
import type { DashboardSeriesMetric, DashboardSeriesPoint } from "../types/dashboard.types";

const METRICS: { key: DashboardSeriesMetric; label: string }[] = [
  { key: "orders", label: "Pedidos" },
  { key: "revenue", label: "Faturamento" },
  { key: "average_ticket", label: "Ticket" },
];

type SalesTrendChartProps = {
  current: DashboardSeriesPoint[];
  previous: DashboardSeriesPoint[];
  insight?: string;
};

export function SalesTrendChart({ current, previous, insight }: SalesTrendChartProps) {
  const [metric, setMetric] = useState<DashboardSeriesMetric>("orders");

  const data = useMemo(() => {
    const len = Math.max(current.length, previous.length);
    const rows = [];
    for (let i = 0; i < len; i++) {
      const cur = current[i];
      const prev = previous[i];
      rows.push({
        label: cur?.label ?? prev?.label ?? "",
        atual: cur?.[metric] ?? 0,
        anterior: prev?.[metric] ?? 0,
      });
    }
    return rows;
  }, [current, previous, metric]);

  const isMoney = metric !== "orders";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {METRICS.map((m) => {
          const active = m.key === metric;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={cn(
                "min-h-8 rounded-full border px-3 text-xs font-medium transition-all",
                active
                  ? "border-transparent bg-brand text-brand-foreground"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.35)]",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="h-44 w-full sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={isMoney ? 56 : 36}
              tickFormatter={(v) => (isMoney ? formatCurrency(Number(v)).replace(/\s/g, "") : String(v))}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                isMoney ? formatCurrency(value) : value,
                name === "atual" ? "Período atual" : "Período anterior",
              ]}
            />
            <Legend
              formatter={(value) => (value === "atual" ? "Período atual" : "Período anterior")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="atual"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey="anterior"
              stroke="hsl(var(--muted-foreground) / 0.45)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {insight ? <p className="text-sm text-[hsl(var(--muted-foreground))]">{insight}</p> : null}
    </div>
  );
}
