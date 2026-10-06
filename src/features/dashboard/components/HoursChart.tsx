import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/shared/lib/utils";
import type { DashboardHourSlot } from "../types/dashboard.types";

function formatSlot(slot: string) {
  const [a, b] = slot.split("-");
  return `${a}h–${b}h`;
}

type HoursChartProps = {
  weekday: DashboardHourSlot[];
  weekend: DashboardHourSlot[];
  peakSlot: string;
  peakOrders: number;
};

export function HoursChart({ weekday, weekend, peakSlot, peakOrders }: HoursChartProps) {
  const [mode, setMode] = useState<"weekday" | "weekend">("weekday");
  const source = mode === "weekday" ? weekday : weekend;

  const data = useMemo(
    () =>
      source
        .filter((s) => {
          const start = Number(s.slot.split("-")[0]);
          return start >= 8 && start < 24;
        })
        .map((s) => ({
          label: formatSlot(s.slot),
          slot: s.slot,
          orders: s.orders,
        })),
    [source],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "weekday" as const, label: "Durante a semana" },
            { id: "weekend" as const, label: "Fim de semana" },
          ] as const
        ).map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={cn(
                "min-h-8 rounded-full border px-2.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent bg-brand text-brand-foreground"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.35)]",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
        Seu horário mais forte: {formatSlot(peakSlot)}
        {peakOrders > 0 ? (
          <span className="font-normal text-[hsl(var(--muted-foreground))]">
            {" "}
            ({peakOrders} {peakOrders === 1 ? "pedido" : "pedidos"})
          </span>
        ) : null}
      </p>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={64}
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
              formatter={(value: number) => [`${value} pedidos`, ""]}
            />
            <Bar dataKey="orders" radius={[0, 8, 8, 0]} animationDuration={500}>
              {data.map((row) => (
                <Cell
                  key={row.slot}
                  fill={
                    row.slot === peakSlot
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
