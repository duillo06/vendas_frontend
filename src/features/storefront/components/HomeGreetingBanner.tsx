import { getDayPart, getHomeGreeting } from "../utils/homeGreeting";
import type { ProductListItem } from "@/features/catalog/types/catalog.types";
import { productHasMatcher, TAG_MATCHERS } from "@/features/catalog/utils/productTags";
import { cn } from "@/shared/lib/utils";

type HomeWelcomeCardProps = {
  products?: ProductListItem[];
  className?: string;
};

/** assinatura FoodFlow — vivo, útil, sem métricas inventadas */
export function HomeWelcomeCard({ products = [], className }: HomeWelcomeCardProps) {
  const greeting = getHomeGreeting();
  const dayPart = getDayPart();

  const champion = products.find(
    (p) => p.is_available && productHasMatcher(p.tags, TAG_MATCHERS.bestsellers),
  );
  const deal = products.find(
    (p) =>
      p.is_available &&
      p.compare_price != null &&
      Number(p.compare_price) > Number(p.base_price),
  );

  let body = greeting.subtitle;
  if (dayPart === "evening" && champion) {
    body = `${champion.name} é um dos mais pedidos neste horário.`;
  } else if (dayPart === "lunch" && deal) {
    body = `Tem promoção em ${deal.name} — vale conferir.`;
  } else if (champion) {
    body = `${greeting.subtitle} Destaque: ${champion.name}.`;
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] via-[hsl(var(--card))] to-[hsl(var(--accent)/0.08)] px-4 py-3.5 shadow-[var(--shadow-xs)] ring-1 ring-[hsl(var(--border)/0.7)]",
        className,
      )}
    >
      <p className="text-base font-semibold tracking-tight text-[hsl(var(--foreground))]">
        {greeting.title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{body}</p>
    </div>
  );
}
