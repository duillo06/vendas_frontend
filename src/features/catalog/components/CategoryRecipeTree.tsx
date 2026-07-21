import type { CategoryRecipe } from "@/features/catalog/api/catalogAdminApi";
import { kindById, type PersonalizationKindId } from "@/features/catalog/utils/conversationalOptions";
import { cn } from "@/shared/lib/utils";

const KIND_LABEL: Record<string, string> = {
  size: "Tamanhos",
  crust: "Bordas",
  extras: "Adicionais",
  buildable: "Ingredientes",
  sauces: "Molhos",
  dough: "Massas",
  volume: "Volumes",
  half: "Meio a meio",
  other: "Outras escolhas",
};

const PRICE_RULE: Record<string, string> = {
  highest: "cobra o sabor mais caro",
  average: "faz a média dos sabores",
  sum: "soma os sabores",
  main: "mantém o preço do produto",
};

type CategoryRecipeTreeProps = {
  recipe: CategoryRecipe;
  className?: string;
};

/** árvore só-leitura — editar = reabrir o assistente */
export function CategoryRecipeTree({ recipe, className }: CategoryRecipeTreeProps) {
  const enabled = recipe.capabilities.filter((c) => c.enabled);
  if (enabled.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium">Ainda não configuramos como esta categoria funciona</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Responda algumas perguntas simples — tamanhos, bordas, meio a meio…
        </p>
      </div>
    );
  }

  const libsByKind = new Map(recipe.libraries.map((lib) => [lib.kind, lib]));

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-semibold tracking-tight">
        Como funciona {recipe.category_name}
      </p>
      <ol className="relative space-y-0 border-l-2 border-[hsl(var(--primary)/0.25)] pl-4">
        {enabled.map((cap, index) => {
          const kind = kindById(cap.kind as PersonalizationKindId);
          const lib = libsByKind.get(cap.kind);
          const title = kind?.label ?? KIND_LABEL[cap.kind] ?? cap.kind;
          const emoji = kind?.emoji ?? "•";

          let detail = "";
          if (cap.kind === "half") {
            const max = Number(cap.settings?.max_parts ?? 2);
            const rule = String(cap.settings?.pricing_rule ?? "highest");
            detail = `até ${max} sabores · ${PRICE_RULE[rule] ?? rule}`;
          } else if (lib) {
            const names = (lib.options ?? []).map((o) => o.name);
            detail =
              names.length > 0
                ? `${names.length} ${names.length === 1 ? "opção" : "opções"} — ${names.slice(0, 4).join(", ")}${names.length > 4 ? "…" : ""}`
                : lib.option_group_name ?? "";
          }

          return (
            <li key={cap.kind} className="relative pb-4 last:pb-0">
              <span
                className="absolute -left-[1.4rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] text-white"
                aria-hidden
              >
                {index + 1}
              </span>
              <p className="text-sm font-medium">
                <span className="mr-1.5" aria-hidden>
                  {emoji}
                </span>
                {title}
                {cap.is_required ? (
                  <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-brand">
                    obrigatório
                  </span>
                ) : null}
              </p>
              {detail ? (
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function summarizeRecipeLines(recipe: CategoryRecipe): string[] {
  const lines: string[] = [];
  const libsByKind = new Map(recipe.libraries.map((lib) => [lib.kind, lib]));

  for (const cap of recipe.capabilities.filter((c) => c.enabled)) {
    const kind = kindById(cap.kind as PersonalizationKindId);
    const label = kind?.label ?? KIND_LABEL[cap.kind] ?? cap.kind;
    if (cap.kind === "half") {
      const max = Number(cap.settings?.max_parts ?? 2);
      const rule = String(cap.settings?.pricing_rule ?? "highest");
      lines.push(`✓ ${label} — até ${max} sabores · ${PRICE_RULE[rule] ?? rule}`);
      continue;
    }
    const lib = libsByKind.get(cap.kind);
    const count = lib?.options?.length ?? lib?.option_ids?.length ?? 0;
    lines.push(`✓ ${label} — ${count} ${count === 1 ? "opção" : "opções"}`);
  }
  return lines;
}
