import type { ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import { cn } from "@/shared/lib/utils";

import {
  INTENT_CATEGORY_LABELS,
  PRODUCT_INTENTS,
  type ProductIntent,
  type ProductIntentCategory,
  type ProductIntentId,
} from "../intents";

type ProductQuickActionsProps = {
  product: ProductAdminDetail;
  onSelect: (id: ProductIntentId) => void;
};

const ORDER: ProductIntentCategory[] = ["essentials", "personalize", "sales", "danger"];

export function ProductQuickActions({ product, onSelect }: ProductQuickActionsProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Ações rápidas</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Um objetivo por card. Toque e resolva em poucos passos.
        </p>
      </div>

      {ORDER.map((category) => {
        const intents = PRODUCT_INTENTS.filter((intent) => intent.category === category);
        return (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide text-[hsl(var(--muted-foreground))] uppercase">
              {INTENT_CATEGORY_LABELS[category]}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {intents.map((intent) => (
                <li key={intent.id}>
                  <ActionCard
                    intent={intent}
                    hint={contextualHint(intent, product)}
                    onClick={() => onSelect(intent.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function ActionCard({
  intent,
  hint,
  onClick,
}: {
  intent: ProductIntent;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "interactive-card group flex w-full items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-white p-3.5 text-left shadow-[var(--shadow-xs)] transition hover:border-[hsl(var(--primary)/0.35)]",
        intent.category === "danger" && "hover:border-red-300",
        intent.comingSoon && "opacity-80",
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-lg transition group-hover:bg-[hsl(var(--primary-soft))]">
        {intent.emoji}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {intent.label}
          {intent.comingSoon ? (
            <span className="rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
              Em breve
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-xs text-[hsl(var(--muted-foreground))]">
          {hint ?? intent.description}
        </span>
      </span>
    </button>
  );
}

function contextualHint(intent: ProductIntent, product: ProductAdminDetail): string | undefined {
  if (intent.id === "composition") {
    return product.composition?.enabled
      ? `Ativo · até ${product.composition.max_parts} sabores`
      : intent.description;
  }
  if (intent.id === "options") {
    const count = product.product_option_groups?.length ?? product.option_group_ids.length;
    return count
      ? `${count} personalizaç${count === 1 ? "ão" : "ões"}`
      : intent.description;
  }
  if (intent.id === "pause") {
    return product.is_available ? "Produto está vendendo agora" : "Já está pausado";
  }
  return undefined;
}
