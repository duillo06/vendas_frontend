import { Link } from "react-router";

import { formatCurrency } from "@/shared/lib/format";
import type { DashboardProductRank } from "../types/dashboard.types";

type ProductRankListProps = {
  items: DashboardProductRank[];
  mode: "top" | "slow";
  insight?: string;
};

export function ProductRankList({ items, mode, insight }: ProductRankListProps) {
  if (!items.length) {
    return (
      <p className="py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        Sem dados de produtos neste período.
      </p>
    );
  }

  const maxQty = Math.max(...items.map((i) => i.quantity), 1);

  return (
    <div className="space-y-2">
      {insight ? <p className="text-xs font-medium text-[hsl(var(--foreground))]">{insight}</p> : null}
      <ul className="space-y-2">
        {items.map((item, index) => {
          const width = mode === "top" ? Math.max(8, (item.quantity / maxQty) * 100) : undefined;
          const href = item.product_id ? `/produtos/${item.product_id}` : "/produtos";
          return (
            <li key={`${item.product_id ?? item.name}-${index}`}>
              <Link
                to={href}
                className="block rounded-lg px-1 py-1 transition-colors hover:bg-[hsl(var(--muted))]/40"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-medium">
                    {mode === "top" ? (
                      <span className="mr-1.5 text-[hsl(var(--muted-foreground))]">{index + 1}.</span>
                    ) : null}
                    {item.name}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[hsl(var(--muted-foreground))]">
                    {item.quantity} un.
                    {mode === "top" ? ` · ${formatCurrency(item.revenue)}` : null}
                  </span>
                </div>
                {mode === "top" ? (
                  <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {item.quantity === 0 ? "Nenhuma venda no período" : "Vendas baixas no período"}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
