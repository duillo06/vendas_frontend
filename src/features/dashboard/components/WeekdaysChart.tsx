import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardWeekday } from "../types/dashboard.types";

type WeekdaysChartProps = {
  days: DashboardWeekday[];
  bestWeekday: number;
  bestOrders: number;
};

export function WeekdaysChart({ days, bestWeekday, bestOrders }: WeekdaysChartProps) {
  const best = days.find((d) => d.weekday === bestWeekday);
  const bestLabel = best?.label ?? "—";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        {bestLabel} costuma ser o melhor dia
        {bestOrders > 0 ? (
          <span className="font-normal text-[hsl(var(--muted-foreground))]">
            {" "}
            ({bestOrders} {bestOrders === 1 ? "pedido" : "pedidos"})
          </span>
        ) : null}
      </p>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
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
            <Bar dataKey="orders" radius={[8, 8, 0, 0]} animationDuration={500}>
              {days.map((d) => (
                <Cell
                  key={d.weekday}
                  fill={
                    d.weekday === bestWeekday
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary) / 0.35)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
