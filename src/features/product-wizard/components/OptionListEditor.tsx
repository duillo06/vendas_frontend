import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { FlowBubble } from "@/features/flow/FlowBubble";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn, createId } from "@/shared/lib/utils";
import type { WizardOptionInput } from "../types";

type LibraryItem = { name: string; price: number };

type OptionListEditorProps = {
  options: WizardOptionInput[];
  suggestions: string[];
  /** itens já salvos na biblioteca da empresa */
  libraryItems?: LibraryItem[];
  onChange: (options: WizardOptionInput[]) => void;
};

function newOption(name: string, price = 0): WizardOptionInput {
  return { key: createId(), name, price };
}

// editor: biblioteca da casa primeiro, depois sugestões e criar novo
export function OptionListEditor({
  options,
  suggestions,
  libraryItems = [],
  onChange,
}: OptionListEditorProps) {
  const [draft, setDraft] = useState("");

  const usedNames = new Set(options.map((o) => o.name.toLowerCase()));

  const toggleLibrary = (item: LibraryItem) => {
    const needle = item.name.toLowerCase();
    if (usedNames.has(needle)) {
      onChange(options.filter((o) => o.name.toLowerCase() !== needle));
      return;
    }
    onChange([...options, newOption(item.name, item.price)]);
  };

  const add = (name: string, price = 0) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (usedNames.has(trimmed.toLowerCase())) return;
    onChange([...options, newOption(trimmed, price)]);
    setDraft("");
  };

  const update = (key: string, patch: Partial<WizardOptionInput>) => {
    onChange(options.map((opt) => (opt.key === key ? { ...opt, ...patch } : opt)));
  };

  const remove = (key: string) => onChange(options.filter((opt) => opt.key !== key));

  const libraryNames = new Set(libraryItems.map((i) => i.name.toLowerCase()));
  const availableSuggestions = suggestions.filter(
    (s) => !usedNames.has(s.toLowerCase()) && !libraryNames.has(s.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {options.length === 0 && libraryItems.length === 0 ? (
        <FlowBubble
          emoji="🥬"
          mood="thinking"
          text="Que tal adicionar o primeiro item? Use as sugestões abaixo."
        />
      ) : null}

      {libraryItems.length > 0 ? (
        <ul className="space-y-1.5">
          {libraryItems.map((item) => {
            const checked = usedNames.has(item.name.toLowerCase());
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => toggleLibrary(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition",
                    checked
                      ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                      : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.25)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                      checked ? "border-brand bg-brand text-white" : "border-[hsl(var(--border))]",
                    )}
                  >
                    {checked ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">{item.name}</span>
                  {item.price > 0 ? (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      +{item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-brand">
                      Biblioteca
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {availableSuggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-1 text-sm font-medium text-brand transition hover:bg-[hsl(var(--muted))]/50"
            >
              <Plus className="h-3.5 w-3.5" />
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {options.map((option) => (
            <motion.div
              key={option.key}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
            >
              <Input
                value={option.name}
                placeholder="Nome"
                className="flex-1"
                onChange={(event) => update(option.key, { name: event.target.value })}
              />
              <div className="w-28 shrink-0">
                <CurrencyInput
                  value={option.price}
                  onChange={(value) => update(option.key, { price: value })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-red-600"
                onClick={() => remove(option.key)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          placeholder="Criar agora..."
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(draft);
            }
          }}
        />
        <Button type="button" variant="outline" className="shrink-0 gap-1" onClick={() => add(draft)}>
          <Plus className="h-4 w-4" />
          Criar
        </Button>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Itens novos entram na biblioteca automaticamente. Preço R$ 0,00 = sem acréscimo.
      </p>
    </div>
  );
}
