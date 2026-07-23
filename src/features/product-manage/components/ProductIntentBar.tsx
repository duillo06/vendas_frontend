import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { FlowPanel } from "@/features/flow";
import { cn } from "@/shared/lib/utils";

import {
  filterIntents,
  PRODUCT_INTENTS,
  resolveIntentForProduct,
  type ProductIntent,
  type ProductIntentId,
} from "../intents";

type ProductIntentBarProps = {
  product: { is_available: boolean };
  onSelect: (id: ProductIntentId) => void;
};

const SUGGESTIONS: ProductIntentId[] = [
  "price",
  "image",
  "composition",
  "options",
  "pause",
  "promo",
];

// campo pronto pra IA — hoje filtra intents; amanhã manda pro assistente
export function ProductIntentBar({ product, onSelect }: ProductIntentBarProps) {
  const [query, setQuery] = useState("");
  const matches = useMemo(
    () => filterIntents(query).map((intent) => resolveIntentForProduct(intent, product)),
    [product, query],
  );
  const chips = useMemo(
    () =>
      SUGGESTIONS.map((id) => {
        const base = PRODUCT_INTENTS.find((intent) => intent.id === id);
        return base ? resolveIntentForProduct(base, product) : undefined;
      }).filter((intent): intent is ProductIntent => Boolean(intent)),
    [product],
  );

  const showResults = query.trim().length > 0;

  return (
    <section className="space-y-3">
      <FlowPanel
        line={{
          emoji: "✨",
          title: "O que você deseja fazer?",
          text: "Digite ou toque num atalho. Cada ação abre um fluxo curto — sem formulário monstro.",
          mood: "idle",
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: alterar preço, meio a meio, pausar…"
            className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-white py-2 pr-3 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]"
            aria-label="O que você deseja fazer com este produto"
          />
        </div>
      </FlowPanel>

      {!showResults ? (
        <ul className="flex flex-wrap gap-2">
          {chips.map((intent) => (
            <li key={intent.id}>
              <button
                type="button"
                onClick={() => onSelect(intent.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs font-medium shadow-[var(--shadow-xs)] transition hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary-soft))]",
                  intent.comingSoon && "opacity-70",
                )}
              >
                <span aria-hidden>{intent.emoji}</span>
                {intent.label}
                {intent.comingSoon ? (
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">em breve</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-sm)]">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[hsl(var(--muted-foreground))]">
              Nada encontrado. Tente “preço”, “foto” ou “sabor”.
            </li>
          ) : (
            matches.slice(0, 6).map((intent) => (
              <li key={intent.id} className="border-b border-[hsl(var(--border))] last:border-0">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[hsl(var(--muted))]/50"
                  onClick={() => {
                    onSelect(intent.id);
                    setQuery("");
                  }}
                >
                  <span className="text-lg" aria-hidden>
                    {intent.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {intent.label}
                      {intent.comingSoon ? (
                        <span className="ml-2 text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                          em breve
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs text-[hsl(var(--muted-foreground))]">
                      {intent.description}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
