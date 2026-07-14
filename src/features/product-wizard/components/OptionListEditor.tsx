import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { FlowBubble } from "@/features/flow/FlowBubble";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { WizardOptionInput } from "../types";

type OptionListEditorProps = {
  options: WizardOptionInput[];
  suggestions: string[];
  onChange: (options: WizardOptionInput[]) => void;
};

function newOption(name: string): WizardOptionInput {
  return { key: crypto.randomUUID(), name, price: 0 };
}

// editor simples de opções: nome + preço opcional, com sugestões clicáveis
export function OptionListEditor({ options, suggestions, onChange }: OptionListEditorProps) {
  const [draft, setDraft] = useState("");

  const add = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange([...options, newOption(trimmed)]);
    setDraft("");
  };

  const update = (key: string, patch: Partial<WizardOptionInput>) => {
    onChange(options.map((opt) => (opt.key === key ? { ...opt, ...patch } : opt)));
  };

  const remove = (key: string) => onChange(options.filter((opt) => opt.key !== key));

  const usedNames = new Set(options.map((o) => o.name.toLowerCase()));
  const availableSuggestions = suggestions.filter((s) => !usedNames.has(s.toLowerCase()));

  return (
    <div className="space-y-4">
      {options.length === 0 ? (
        <FlowBubble
          emoji="🥬"
          mood="thinking"
          text="Que tal adicionar o primeiro item? Use as sugestões abaixo."
        />
      ) : null}

      {availableSuggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-soft bg-brand-soft/20 px-3 py-1 text-sm font-medium text-brand transition hover:bg-brand-soft/40"
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
                placeholder="Nome da opção"
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
          placeholder="Adicionar opção..."
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
          Adicionar
        </Button>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        Deixe o preço em R$ 0,00 quando a opção não muda o valor. O preço é somado ao produto.
      </p>
    </div>
  );
}
