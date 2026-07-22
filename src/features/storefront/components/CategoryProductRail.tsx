import { Link } from "react-router";

import { ProductRail } from "@/features/catalog/components/ProductRail";
import type { HomeCategoryRail } from "@/features/storefront/utils/buildHomeVitrine";
import { resolveMediaUrl } from "@/shared/lib/media";

type Props = {
  rail: HomeCategoryRail;
};

/** trilho horizontal por categoria — capa discreta + scroll de cards */
export function CategoryProductRail({ rail }: Props) {
  const { category, products, coverUrl, totalAvailable } = rail;
  const emoji = category.emoji?.trim();
  const title = emoji ? `${emoji} ${category.name}` : category.name;
  const cover = resolveMediaUrl(coverUrl);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--muted)/0.35)] px-3 py-2.5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[hsl(var(--muted))] shadow-[var(--shadow-xs)] ring-1 ring-[hsl(var(--border)/0.55)]">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-xl" aria-hidden>
              {emoji || "🍽️"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight sm:text-[17px]">
              {title}
            </h3>
            <Link
              to={`/categoria/${category.slug}`}
              className="shrink-0 text-xs font-semibold text-brand hover:underline"
            >
              Ver tudo →
            </Link>
          </div>
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {totalAvailable} {totalAvailable === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </div>

      <ProductRail products={products} />
    </section>
  );
}
