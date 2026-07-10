import { getFeatureEmoji } from "@/features/storefront/utils/productBadges";
import { cn } from "@/shared/lib/utils";

type ProductFeatureChipsProps = {
  items: string[];
  title?: string;
  className?: string;
};

export function ProductFeatureChips({ items, title, className }: ProductFeatureChipsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {title ? <h2 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{title}</h2> : null}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-soft bg-brand-soft/50 px-3 py-2 text-sm font-medium"
          >
            <span aria-hidden>{getFeatureEmoji(item)}</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
