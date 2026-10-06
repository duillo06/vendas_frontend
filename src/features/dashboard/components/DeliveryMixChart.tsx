import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardDeliveryMix } from "../types/dashboard.types";

type DeliveryMixChartProps = {
  mix: DashboardDeliveryMix;
};

export function DeliveryMixChart({ mix }: DeliveryMixChartProps) {
  if (!mix.items.length) {
    return (
      <p className="py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Sem pedidos concluídos neste período.
      </p>
    );
  }

  const lead = mix.items[0];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">
        {lead.label} lidera com {lead.pct.toFixed(0)}%
        <span className="font-normal text-[hsl(var(--muted-foreground))]">
          {" "}
          ({lead.orders} {lead.orders === 1 ? "pedido" : "pedidos"})
        </span>
      </p>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mix.items} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={72}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.45)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                fontSize: 12,
              }}
              formatter={(value: number, _name, props) => {
                const pct = (props?.payload as { pct?: number } | undefined)?.pct;
                return [`${value} pedidos${pct != null ? ` (${pct}%)` : ""}`, ""];
              }}
            />
            <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
