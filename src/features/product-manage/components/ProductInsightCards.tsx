import {
  CircleDollarSign,
  Heart,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import { getActiveShowcaseLabels } from "@/features/catalog/utils/productTags";
import { cn } from "@/shared/lib/utils";

type ProductInsightCardsProps = {
  product: ProductAdminDetail;
};

type Insight = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  soon?: boolean;
};

export function ProductInsightCards({ product }: ProductInsightCardsProps) {
  const optionCount = product.product_option_groups?.length ?? product.option_group_ids.length;
  const showcase = getActiveShowcaseLabels(product.tags ?? []);

  const insights: Insight[] = [
    {
      label: "Preço base",
      value: formatMoney(product.base_price),
      icon: CircleDollarSign,
    },
    {
      label: "Status",
      value: !product.is_active ? "Arquivado" : product.is_available ? "Disponível" : "Pausado",
      icon: Package,
    },
    {
      label: "Vitrine",
      value: showcase.length
        ? `${showcase.length} destaque${showcase.length === 1 ? "" : "s"}`
        : "Sem destaque",
      hint: showcase.slice(0, 2).join(" · ") || "Configure em Destaques na vitrine",
      icon: Star,
    },
    {
      label: "Como vende",
      value: optionCount ? `${optionCount} itens` : "Só o básico",
      hint: product.composition?.enabled ? "Com combinação de sabores" : undefined,
      icon: ShoppingBag,
    },
    {
      label: "Fotos",
      value: String(product.images.length),
      icon: Heart,
    },
    {
      label: "Vendas hoje",
      value: "—",
      soon: true,
      icon: ShoppingBag,
    },
    {
      label: "Vendas no mês",
      value: "—",
      soon: true,
      icon: TrendingUp,
    },
    {
      label: "Favoritos",
      value: "—",
      soon: true,
      icon: Heart,
    },
    {
      label: "Margem",
      value: "—",
      soon: true,
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Painel rápido</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Números à mão. Métricas de venda chegam em breve sem mudar o layout.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {insights.map((insight) => (
          <li
            key={insight.label}
            className={cn(
              "rounded-xl border border-[hsl(var(--border))] bg-white p-3 shadow-[var(--shadow-xs)]",
              insight.soon && "border-dashed",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <insight.icon className="h-4 w-4 text-brand" />
              {insight.soon ? (
                <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                  Em breve
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
              {insight.label}
            </p>
            <p className="text-base font-semibold tracking-tight">{insight.value}</p>
            {insight.hint ? (
              <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{insight.hint}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
