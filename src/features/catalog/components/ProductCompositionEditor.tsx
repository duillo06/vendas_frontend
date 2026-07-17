import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { catalogAdminApi, type ProductCompositionAdmin } from "../api/catalogAdminApi";
import { catalogAdminKeys } from "../constants/catalog-admin-keys";
import type { CategoryAdmin } from "../api/catalogAdminApi";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export type CompositionForm = ProductCompositionAdmin;

export const DEFAULT_COMPOSITION: CompositionForm = {
  enabled: false,
  source_type: "category",
  source_category_id: null,
  source_tag: "",
  custom_product_ids: [],
  label: "Escolher outro sabor",
  // 1 = só o produto; 2 = pode (opcional) combinar mais 1 sabor
  min_parts: 1,
  max_parts: 2,
  pricing_rule: "highest",
};

type Props = {
  value: CompositionForm;
  onChange: (next: CompositionForm) => void;
  categories?: CategoryAdmin[];
  currentProductId?: string;
};

const MAX_PRESETS = [2, 3, 4] as const;

const PRICE_OPTIONS: {
  value: CompositionForm["pricing_rule"];
  label: string;
  description: string;
}[] = [
  {
    value: "highest",
    label: "Cobrar o sabor mais caro",
    description: "Ideal para pizzas meio a meio.",
  },
  {
    value: "average",
    label: "Fazer a média dos sabores",
    description: "Muito utilizado em algumas pizzarias.",
  },
  {
    value: "sum",
    label: "Somar os valores",
    description: "Cada sabor soma ao valor final.",
  },
  {
    value: "main",
    label: "Definir um valor próprio",
    description: "Você define manualmente quanto custa — usa o preço deste produto.",
  },
];

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export function ProductCompositionEditor({ value, onChange, categories, currentProductId }: Props) {
  const patch = (partial: Partial<CompositionForm>) => onChange({ ...value, ...partial });

  const [flavorSearch, setFlavorSearch] = useState("");
  // "outro número" no max — mostra input livre
  const [customMax, setCustomMax] = useState(
    () => value.max_parts > 4 || (value.enabled && !MAX_PRESETS.includes(value.max_parts as 2 | 3 | 4)),
  );

  // origem: "todos desta cat" = category sem id; "outra" = category com id
  const sourceMode: "same" | "other" | "custom" | "tag" =
    value.source_type === "custom"
      ? "custom"
      : value.source_type === "tag"
        ? "tag"
        : value.source_category_id
          ? "other"
          : "same";

  const requiredExtra = value.min_parts >= 2;
  const allowsMulti = value.enabled;

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: [...catalogAdminKeys.products(), "composition-picker"],
    queryFn: () => catalogAdminApi.listProducts({ page_size: "100" }),
    enabled: allowsMulti && sourceMode === "custom",
  });

  const filteredProducts = useMemo(() => {
    const q = flavorSearch.trim().toLowerCase();
    return (products?.results ?? [])
      .filter((p) => p.id !== currentProductId)
      .filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, currentProductId, flavorSearch]);

  const setAllowsMulti = (yes: boolean) => {
    if (!yes) {
      setCustomMax(false);
      patch({
        enabled: false,
        min_parts: 1,
        max_parts: 2,
      });
      return;
    }
    patch({
      enabled: true,
      max_parts: Math.max(value.max_parts, 2),
      min_parts: value.min_parts >= 2 ? Math.min(value.min_parts, Math.max(value.max_parts, 2)) : 1,
    });
  };

  const setMaxParts = (max: number) => {
    const safe = Math.max(2, Math.min(max, 12));
    patch({
      max_parts: safe,
      min_parts: requiredExtra ? Math.min(Math.max(value.min_parts, 2), safe) : 1,
    });
  };

  const setRequiredExtra = (yes: boolean) => {
    patch({ min_parts: yes ? Math.min(Math.max(2, value.min_parts), value.max_parts) : 1 });
  };

  const setSourceMode = (mode: "same" | "other" | "custom") => {
    if (mode === "same") {
      patch({ source_type: "category", source_category_id: null, source_tag: "" });
      return;
    }
    if (mode === "other") {
      const firstOther = categories?.find((c) => c.id)?.id ?? null;
      patch({
        source_type: "category",
        source_category_id: value.source_category_id || firstOther,
        source_tag: "",
      });
      return;
    }
    patch({ source_type: "custom", source_tag: "" });
  };

  const toggleCustom = (id: string) => {
    const set = new Set(value.custom_product_ids);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ custom_product_ids: [...set] });
  };

  const preview = buildPreview(value, requiredExtra);

  return (
    <div className="space-y-8">
      {/* Etapa 1 — porta de entrada */}
      <QuestionBlock
        title="Esta pizza permite mais de um sabor?"
        description="Ex.: meio a meio, três sabores, quatro sabores…"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <OptionCard
            label="Não"
            description="Só um sabor — como está hoje."
            selected={!allowsMulti}
            onSelect={() => setAllowsMulti(false)}
          />
          <OptionCard
            label="Sim"
            description="O cliente poderá combinar sabores."
            selected={allowsMulti}
            onSelect={() => setAllowsMulti(true)}
          />
        </div>
      </QuestionBlock>

      <AnimatePresence initial={false}>
        {allowsMulti ? (
          <motion.div key="multi-steps" className="space-y-8" {...stepMotion}>
            {/* Etapa 2 */}
            <QuestionBlock
              title="Quantos sabores o cliente pode escolher?"
              description="Inclui o sabor principal deste produto."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {MAX_PRESETS.map((n) => (
                  <OptionCard
                    key={n}
                    label={n === 2 ? "Até 2 sabores (Meio a Meio)" : `Até ${n} sabores`}
                    selected={!customMax && value.max_parts === n}
                    onSelect={() => {
                      setCustomMax(false);
                      setMaxParts(n);
                    }}
                  />
                ))}
                <OptionCard
                  label="Outro número"
                  description="Defina a quantidade."
                  selected={customMax}
                  onSelect={() => {
                    setCustomMax(true);
                    if (MAX_PRESETS.includes(value.max_parts as 2 | 3 | 4)) {
                      setMaxParts(5);
                    }
                  }}
                />
              </div>
              <AnimatePresence initial={false}>
                {customMax ? (
                  <motion.div key="custom-max" className="mt-3 flex items-center gap-2" {...stepMotion}>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Até</span>
                    <Input
                      type="number"
                      min={2}
                      max={12}
                      className="h-11 w-20 text-center"
                      value={value.max_parts}
                      onChange={(e) => setMaxParts(Number(e.target.value) || 2)}
                    />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">sabores</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </QuestionBlock>

            {/* Etapa 3 */}
            <QuestionBlock
              title="O cliente é obrigado a escolher outro sabor?"
              description="Quando ativado, o cliente obrigatoriamente deverá escolher mais um sabor. Ex.: pizza meio a meio obrigatória."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <OptionCard
                  label="Não"
                  description="Pode pedir só este sabor, se quiser."
                  selected={!requiredExtra}
                  onSelect={() => setRequiredExtra(false)}
                />
                <OptionCard
                  label="Sim"
                  description="Sempre combina com pelo menos mais um."
                  selected={requiredExtra}
                  onSelect={() => setRequiredExtra(true)}
                />
              </div>
            </QuestionBlock>

            {/* Etapa 4 */}
            <QuestionBlock
              title="Como será calculado o preço?"
              description="Isso define o valor que o cliente vê no cardápio."
            >
              <div className="space-y-2">
                {PRICE_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.description}
                    selected={value.pricing_rule === opt.value}
                    onSelect={() => patch({ pricing_rule: opt.value })}
                  />
                ))}
              </div>
            </QuestionBlock>

            {/* Etapa 5 */}
            <QuestionBlock
              title="Quais sabores poderão ser escolhidos?"
              description="O cliente só vê o que você liberar aqui."
            >
              <div className="space-y-2">
                <OptionCard
                  label="Todos desta categoria"
                  description="Mesma categoria deste produto."
                  selected={sourceMode === "same"}
                  onSelect={() => setSourceMode("same")}
                />
                <OptionCard
                  label="Outra categoria"
                  description="Ex.: sabores de outra lista."
                  selected={sourceMode === "other"}
                  onSelect={() => setSourceMode("other")}
                />
                <OptionCard
                  label="Escolher sabores específicos"
                  description="Você marca um a um."
                  selected={sourceMode === "custom"}
                  onSelect={() => setSourceMode("custom")}
                />
              </div>

              <AnimatePresence initial={false}>
                {sourceMode === "other" ? (
                  <motion.div key="other-cat" className="mt-3 space-y-2" {...stepMotion}>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Qual categoria?</p>
                    <select
                      className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 text-sm"
                      value={value.source_category_id ?? ""}
                      onChange={(e) => patch({ source_category_id: e.target.value || null })}
                    >
                      <option value="">Selecione…</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ) : null}

                {sourceMode === "custom" ? (
                  <motion.div key="custom-list" className="mt-3 space-y-3" {...stepMotion}>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        value={flavorSearch}
                        onChange={(e) => setFlavorSearch(e.target.value)}
                        placeholder="Buscar sabor…"
                        className="h-11 pl-9"
                      />
                    </div>
                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[hsl(var(--border))] p-2">
                      {loadingProducts ? (
                        <p className="px-2 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                          Carregando sabores…
                        </p>
                      ) : null}
                      {!loadingProducts && filteredProducts.length === 0 ? (
                        <p className="px-2 py-3 text-sm text-[hsl(var(--muted-foreground))]">
                          Nenhum sabor encontrado.
                        </p>
                      ) : null}
                      {filteredProducts.map((p) => {
                        const checked = value.custom_product_ids.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className={cn(
                              "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              checked
                                ? "bg-[hsl(var(--primary-soft))]"
                                : "hover:bg-[hsl(var(--muted))]/60",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                                checked
                                  ? "border-brand bg-brand text-white"
                                  : "border-[hsl(var(--border))]",
                              )}
                            >
                              {checked ? <Check className="h-3.5 w-3.5" /> : null}
                            </span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={checked}
                              onChange={() => toggleCustom(p.id)}
                            />
                            {p.name}
                          </label>
                        );
                      })}
                    </div>
                    {value.custom_product_ids.length > 0 ? (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {value.custom_product_ids.length} sabor
                        {value.custom_product_ids.length === 1 ? "" : "es"} selecionado
                        {value.custom_product_ids.length === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </QuestionBlock>

            {/* Preview em tempo real */}
            <motion.div
              layout
              className="rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))]/40 p-4 sm:p-5"
            >
              <p className="text-sm font-semibold">🍕 Assim ficará para seu cliente</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={preview.join("|")}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 space-y-1.5"
                >
                  {preview.map((line) => (
                    <p key={line} className="text-sm text-[hsl(var(--foreground))]/90">
                      {line}
                    </p>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* tag já configurada — não some sem aviso */}
      {value.enabled && value.source_type === "tag" && value.source_tag ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Esta configuração usa uma tag ({value.source_tag}). Ao escolher outra opção acima, a tag
          deixa de valer.
        </p>
      ) : null}
    </div>
  );
}

function QuestionBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold leading-snug tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))] shadow-sm"
          : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--muted))]/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-brand bg-brand text-white" : "border-[hsl(var(--border))]",
        )}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-snug text-[hsl(var(--muted-foreground))]">
            {description}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

// resumo em português — o que o cliente vai viver no cardápio
function buildPreview(value: CompositionForm, requiredExtra: boolean): string[] {
  if (!value.enabled) return [];

  const lines: string[] = [];

  if (requiredExtra && value.max_parts === 2) {
    lines.push("O cliente será obrigado a escolher 2 sabores.");
  } else if (requiredExtra) {
    lines.push(
      `O cliente deverá escolher entre 2 e ${value.max_parts} sabores.`,
    );
  } else {
    lines.push(`O cliente poderá escolher até ${value.max_parts} sabores.`);
  }

  const priceLine: Record<CompositionForm["pricing_rule"], string> = {
    highest: "O preço será calculado pelo sabor mais caro.",
    average: "O preço será a média dos sabores.",
    sum: "O preço será a soma dos sabores.",
    main: "O preço será definido manualmente.",
  };
  lines.push(priceLine[value.pricing_rule]);

  if (value.source_type === "custom") {
    const n = value.custom_product_ids.length;
    lines.push(
      n > 0
        ? `Só entre os ${n} sabor${n === 1 ? "" : "es"} que você marcou.`
        : "Ainda não há sabores específicos selecionados.",
    );
  } else if (value.source_category_id) {
    lines.push("Os sabores virão de outra categoria.");
  } else {
    lines.push("Os sabores serão todos desta categoria.");
  }

  return lines;
}
