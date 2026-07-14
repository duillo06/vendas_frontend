import { Check } from "lucide-react";

import type { CategoryAdmin } from "@/features/catalog/api/catalogAdminApi";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import type { ProductWizard } from "../useProductWizard";

type ReviewStepProps = {
  wizard: ProductWizard;
  categories: CategoryAdmin[];
};

export function ReviewStep({ wizard, categories }: ReviewStepProps) {
  const { state, blueprint, groups, composition } = wizard;
  const category = categories.find((c) => c.id === state.basics.categoryId);
  const preview = state.images[0]?.previewUrl;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
        {preview ? (
          <img src={preview} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-brand-soft/40 text-4xl">
            {blueprint?.emoji ?? "🍽️"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{state.basics.name || "Sem nome"}</p>
          {category ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{category.name}</p>
          ) : null}
          <p className="mt-1 text-base font-semibold text-brand">
            {formatCurrency(state.basePrice)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">O que você configurou</p>
        {composition ? (
          <div className="flex items-center gap-3 rounded-xl border border-brand-soft bg-brand-soft/20 p-3">
            <span className="text-xl">🍕</span>
            <div className="flex-1">
              <p className="text-sm font-medium">Composição de sabores</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                O cliente combina com outros produtos da mesma categoria.
              </p>
            </div>
            <Check className="h-5 w-5 text-brand" />
          </div>
        ) : null}
        {groups.length === 0 && !composition ? (
          <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] p-3 text-sm text-[hsl(var(--muted-foreground))]">
            Produto simples, sem opções para o cliente escolher.
          </div>
        ) : (
          groups.map((group) => {
            const count = (state.optionsByGroup[group.key] ?? []).filter((o) => o.name.trim()).length;
            return (
              <div
                key={group.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  count > 0
                    ? "border-[hsl(var(--border))]"
                    : "border-dashed border-amber-300 bg-amber-50",
                )}
              >
                <span className="text-xl">{group.emoji ?? "•"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {count > 0 ? `${count} ${count === 1 ? "opção" : "opções"}` : "Nenhuma opção adicionada"}
                  </p>
                </div>
                {count > 0 ? <Check className="h-5 w-5 text-brand" /> : null}
              </div>
            );
          })
        )}
      </div>

      <p className="rounded-xl bg-brand-soft/30 p-3 text-center text-sm font-medium text-brand">
        🚀 Tudo pronto! Clique em Criar produto para publicar no cardápio.
      </p>
    </div>
  );
}
