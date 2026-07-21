import { ImageIcon } from "lucide-react";

import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import { formatCategoryLabel } from "@/features/catalog/utils/categoryLabel";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { cn } from "@/shared/lib/utils";

type ProductManageHeaderProps = {
  product: ProductAdminDetail;
};

export function ProductManageHeader({ product }: ProductManageHeaderProps) {
  const cover =
    product.images.find((image) => image.is_primary)?.image_url ?? product.images[0]?.image_url;
  const badges = buildBadges(product);

  return (
    <section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-6">
        <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] sm:mx-0 sm:h-32 sm:w-32">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
              <ImageIcon className="h-8 w-8 opacity-40" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Gerenciar produto
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {formatCategoryLabel(product.category)}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <PriceDisplay value={product.base_price} className="text-xl font-bold text-brand" />
            <StatusChip available={product.is_available} active={product.is_active} />
          </div>

          {badges.length ? (
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-2.5 py-0.5 text-[11px] font-medium"
                >
                  {badge}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatusChip({ available, active }: { available: boolean; active: boolean }) {
  if (!active) {
    return (
      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
        Arquivado
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        available
          ? "bg-brand text-[hsl(var(--primary-foreground))]"
          : "bg-amber-100 text-amber-800",
      )}
    >
      {available ? "Disponível" : "Pausado"}
    </span>
  );
}

function buildBadges(product: ProductAdminDetail): string[] {
  const badges: string[] = [];
  if (product.composition?.enabled) badges.push("Meio a meio");
  if ((product.product_option_groups?.length ?? 0) > 0 || product.option_group_ids.length > 0) {
    badges.push("Opções da casa");
  }
  if (product.compare_price != null && product.compare_price > product.base_price) {
    badges.push("Em promoção");
  }
  if (!product.images.length) badges.push("Sem foto");
  return badges;
}
