import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardPaymentMethod } from "../types/dashboard.types";

type PaymentsChartProps = {
  methods: DashboardPaymentMethod[];
};

export function PaymentsChart({ methods }: PaymentsChartProps) {
  if (!methods.length) {
    return (
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        Ainda não há pagamentos concluídos neste período.
      </p>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={methods} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
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
            formatter={(value: number) => [`${value} pedidos`, ""]}
          />
          <Bar
            dataKey="orders"
            fill="hsl(var(--primary))"
            radius={[0, 8, 8, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
