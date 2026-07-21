import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  catalogAdminApi,
  type CategoryRecipe,
  type CategoryRecipeWrite,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import {
  saveCanonicalFromDraft,
} from "@/features/catalog/utils/canonicalLibrary";
import {
  buildLibraryItems,
  draftFromKind,
  isCategoryPricedKind,
  kindById,
  newChoice,
  suggestedKindIds,
  type CustomizationDraft,
  type LibraryItem,
  type PersonalizationKind,
  type PersonalizationKindId,
} from "@/features/catalog/utils/conversationalOptions";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type KindAnswer = {
  kindId: PersonalizationKindId;
  enabled: boolean;
  groupId?: string;
  groupName?: string;
  optionIds: string[];
  optionNames: string[];
  /** preços padrão Tipo 2 (paralelo a optionIds) */
  optionPrices: number[];
  half?: {
    min_parts: number;
    max_parts: number;
    pricing_rule: "highest" | "average" | "sum" | "main";
    label: string;
  };
};

type Step = "intro" | "gate" | "library" | "create-item" | "prices" | "half" | "summary" | "apply";

type CategoryRecipeAssistantProps = {
  categoryId: string;
  categoryName: string;
  productCount?: number;
  initialRecipe?: CategoryRecipe | null;
  onCancel: () => void;
  onSaved: (recipe: CategoryRecipe) => void;
};

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

const HALF_RULES = [
  { value: "highest" as const, label: "Cobra o sabor mais caro" },
  { value: "average" as const, label: "Faz a média dos sabores" },
  { value: "sum" as const, label: "Soma os sabores" },
];

function answersFromRecipe(recipe: CategoryRecipe | null | undefined): KindAnswer[] {
  if (!recipe?.capabilities?.length) return [];
  const libs = new Map(recipe.libraries.map((l) => [l.kind, l]));
  const priceMap = new Map(
    (recipe.option_prices ?? []).map((p) => [p.option_id, Number(p.price)]),
  );
  const out: KindAnswer[] = [];
  for (const cap of recipe.capabilities) {
    const kindId = cap.kind as PersonalizationKindId;
    if (!kindById(kindId)) continue;
    const lib = libs.get(cap.kind);
    const pricing =
      cap.settings?.pricing_rule === "average" ||
      cap.settings?.pricing_rule === "sum" ||
      cap.settings?.pricing_rule === "main"
        ? cap.settings.pricing_rule
        : "highest";
    const optionIds = lib?.option_ids ?? [];
    const optionNames = (lib?.options ?? []).map((o) => o.name);
    out.push({
      kindId,
      enabled: cap.enabled,
      groupId: lib?.option_group_id,
      groupName: lib?.option_group_name,
      optionIds,
      optionNames:
        optionNames.length === optionIds.length
          ? optionNames
          : optionIds.map((_, i) => optionNames[i] ?? `Item ${i + 1}`),
      optionPrices: optionIds.map((id) => priceMap.get(id) ?? 0),
      half:
        kindId === "half"
          ? {
              min_parts: Number(cap.settings?.min_parts ?? 2),
              max_parts: Number(cap.settings?.max_parts ?? 2),
              pricing_rule: pricing,
              label: String(cap.settings?.label ?? "Escolher outro sabor"),
            }
          : undefined,
    });
  }
  return out;
}

function buildQueue(categoryName: string, existing: KindAnswer[]): PersonalizationKindId[] {
  const suggested = suggestedKindIds(categoryName);
  const fromExisting = existing.filter((a) => a.enabled).map((a) => a.kindId);
  const merged = [...suggested];
  for (const id of fromExisting) {
    if (!merged.includes(id)) merged.push(id);
  }
  return merged;
}

export function CategoryRecipeAssistant({
  categoryId,
  categoryName,
  productCount = 0,
  initialRecipe,
  onCancel,
  onSaved,
}: CategoryRecipeAssistantProps) {
  const { data: availableGroups = [] } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const [answers, setAnswers] = useState<KindAnswer[]>(() => answersFromRecipe(initialRecipe));
  const [queue] = useState(() => buildQueue(categoryName, answersFromRecipe(initialRecipe)));
  const [queueIndex, setQueueIndex] = useState(0);
  const [step, setStep] = useState<Step>("intro");
  const [draft, setDraft] = useState<CustomizationDraft | null>(null);
  const [halfDraft, setHalfDraft] = useState({
    max_parts: 2,
    pricing_rule: "highest" as const,
  });
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [localGroups, setLocalGroups] = useState<OptionGroupAdmin[]>([]);
  const [applyMode, setApplyMode] = useState<"new_only" | "all" | "later">("new_only");

  const mergedGroups = useMemo(() => {
    const map = new Map<string, OptionGroupAdmin>();
    for (const g of availableGroups) map.set(g.id, g);
    for (const g of localGroups) map.set(g.id, g);
    return [...map.values()];
  }, [availableGroups, localGroups]);

  const currentKindId = queue[queueIndex] as PersonalizationKindId | undefined;
  const currentKind = currentKindId ? kindById(currentKindId) : null;

  const libraryItems = useMemo(() => {
    if (!currentKind || currentKind.opensComposition) return [];
    return buildLibraryItems(mergedGroups, currentKind, new Set());
  }, [currentKind, mergedGroups]);

  const selectedNames = useMemo(
    () => new Set((draft?.choices ?? []).map((c) => c.name.trim().toLowerCase()).filter(Boolean)),
    [draft],
  );

  const startKind = (index: number) => {
    const kindId = queue[index];
    const kind = kindId ? kindById(kindId) : null;
    if (!kind) {
      setStep("summary");
      return;
    }
    setQueueIndex(index);
    setError(null);
    const prev = answers.find((a) => a.kindId === kind.id);
    if (kind.opensComposition) {
      setHalfDraft({
        max_parts: prev?.half?.max_parts ?? 2,
        pricing_rule: prev?.half?.pricing_rule ?? "highest",
      });
      setStep("gate");
      return;
    }
    setDraft(
      prev?.enabled && prev.optionNames.length
        ? {
            ...draftFromKind(kind),
            choices: prev.optionNames.map((name, i) => ({
              key: prev.optionIds[i] ?? name,
              id: prev.optionIds[i],
              name,
              price: 0,
            })),
          }
        : draftFromKind(kind),
    );
    setStep("gate");
  };

  const goNextKind = () => {
    const next = queueIndex + 1;
    if (next >= queue.length) {
      setStep("summary");
      return;
    }
    startKind(next);
  };

  const recordDisabled = (kind: PersonalizationKind) => {
    setAnswers((current) => {
      const without = current.filter((a) => a.kindId !== kind.id);
      return [
        ...without,
        { kindId: kind.id, enabled: false, optionIds: [], optionNames: [], optionPrices: [] },
      ];
    });
    goNextKind();
  };

  const toggleLibraryItem = (item: LibraryItem) => {
    if (!draft) return;
    const needle = item.name.toLowerCase();
    setDraft((d) => {
      if (!d) return d;
      const exists = d.choices.some((c) => c.name.trim().toLowerCase() === needle);
      if (exists) {
        return { ...d, choices: d.choices.filter((c) => c.name.trim().toLowerCase() !== needle) };
      }
      return {
        ...d,
        choices: [...d.choices, newChoice(item.name, 0, item.description ?? "")],
      };
    });
  };

  const confirmLibrary = async (kind: PersonalizationKind) => {
    if (!draft) return;
    const named = draft.choices.filter((c) => c.name.trim());
    if (named.length === 0) {
      setError("Marque ou crie pelo menos uma opção.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { group } = await saveCanonicalFromDraft(draft, mergedGroups);
      setLocalGroups((curr) => [...curr.filter((g) => g.id !== group.id), group]);
      const byName = new Map(group.options.map((o) => [o.name.trim().toLowerCase(), o]));
      const optionIds: string[] = [];
      const optionNames: string[] = [];
      for (const choice of named) {
        const opt = byName.get(choice.name.trim().toLowerCase());
        if (!opt) continue;
        optionIds.push(opt.id);
        optionNames.push(opt.name);
      }
      setAnswers((current) => {
        const without = current.filter((a) => a.kindId !== kind.id);
        return [
          ...without,
          {
            kindId: kind.id,
            enabled: true,
            groupId: group.id,
            groupName: group.name,
            optionIds,
            optionNames,
            optionPrices: optionIds.map(() => 0),
          },
        ];
      });
      if (isCategoryPricedKind(kind.id)) {
        setStep("prices");
      } else {
        goNextKind();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu pra salvar na base.");
    } finally {
      setPending(false);
    }
  };

  const confirmHalf = (kind: PersonalizationKind) => {
    setAnswers((current) => {
      const without = current.filter((a) => a.kindId !== kind.id);
      return [
        ...without,
        {
          kindId: kind.id,
          enabled: true,
          optionIds: [],
          optionNames: [],
          optionPrices: [],
          half: {
            min_parts: 2,
            max_parts: halfDraft.max_parts,
            pricing_rule: halfDraft.pricing_rule,
            label: "Escolher outro sabor",
          },
        },
      ];
    });
    goNextKind();
  };

  const confirmCategoryPrices = () => {
    goNextKind();
  };

  const buildPayload = (mode: "new_only" | "all" | "later" = "new_only"): CategoryRecipeWrite => {
    const enabled = answers.filter((a) => a.enabled);
    const capabilities = enabled.map((a, index) => ({
      kind: a.kindId,
      enabled: true,
      is_required: kindById(a.kindId)?.is_required ?? false,
      sort_order: index,
      settings: a.half
        ? {
            min_parts: a.half.min_parts,
            max_parts: a.half.max_parts,
            pricing_rule: a.half.pricing_rule,
            label: a.half.label,
          }
        : {},
    }));
    const libraries = enabled
      .filter((a) => a.kindId !== "half" && a.groupId && a.optionIds.length)
      .map((a, index) => ({
        kind: a.kindId,
        option_group_id: a.groupId!,
        sort_order: index,
        option_ids: a.optionIds,
      }));
    const option_prices = enabled
      .filter((a) => isCategoryPricedKind(a.kindId))
      .flatMap((a) =>
        a.optionIds.map((option_id, i) => ({
          option_id,
          price: a.optionPrices[i] ?? 0,
        })),
      );
    return { capabilities, libraries, option_prices, template_key: "", apply_mode: mode };
  };

  const saveRecipe = async (mode: "new_only" | "all" | "later" = applyMode) => {
    const payload = buildPayload(mode);
    if (payload.capabilities.length === 0) {
      setError("Marque pelo menos uma coisa que esta categoria faz — ou cancele.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const saved = await catalogAdminApi.putCategoryRecipe(categoryId, payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu pra salvar a receita.");
    } finally {
      setPending(false);
    }
  };

  const summaryLines = answers
    .filter((a) => a.enabled)
    .map((a) => {
      const kind = kindById(a.kindId);
      const label = kind?.label ?? a.kindId;
      if (a.kindId === "half" && a.half) {
        const rule = HALF_RULES.find((r) => r.value === a.half!.pricing_rule)?.label ?? "";
        return `✓ ${label} — até ${a.half.max_parts} sabores · ${rule.toLowerCase()}`;
      }
      if (isCategoryPricedKind(a.kindId) && a.optionNames.length) {
        const priced = a.optionNames
          .map((name, i) => {
            const p = a.optionPrices[i] ?? 0;
            return `${name} ${p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
          })
          .slice(0, 4)
          .join(" · ");
        return `✓ ${label} — ${priced}${a.optionNames.length > 4 ? "…" : ""}`;
      }
      return `✓ ${label} — ${a.optionNames.length} ${a.optionNames.length === 1 ? "opção" : "opções"}`;
    });

  const confirmSummary = () => {
    if (summaryLines.length === 0) {
      setError("Marque pelo menos uma coisa que esta categoria faz — ou cancele.");
      return;
    }
    if (productCount > 0) {
      setStep("apply");
      return;
    }
    void saveRecipe("new_only");
  };

  const goBack = () => {
    setError(null);
    if (step === "create-item") {
      setStep("library");
      return;
    }
    if (step === "prices") {
      setStep("library");
      return;
    }
    if (step === "library" || step === "half") {
      setStep("gate");
      return;
    }
    if (step === "apply") {
      setStep("summary");
      return;
    }
    if (step === "gate") {
      if (queueIndex === 0) {
        setStep("intro");
        return;
      }
      startKind(queueIndex - 1);
      return;
    }
    if (step === "summary") {
      startKind(Math.max(0, queue.length - 1));
    }
  };

  return (
    <div className="space-y-5">
      {step !== "intro" ? (
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {step === "intro" ? (
          <motion.div key="intro" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold leading-snug sm:text-lg">
                Vamos configurar como normalmente funciona {categoryName}
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Perguntas simples — o que valer pra todos os produtos desta categoria.
              </p>
            </div>
            <Button
              type="button"
              className="bg-brand hover:brightness-95"
              onClick={() => startKind(0)}
            >
              Começar
            </Button>
          </motion.div>
        ) : null}

        {step === "gate" && currentKind ? (
          <motion.div key={`gate-${currentKind.id}`} className="space-y-4" {...stepMotion}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand">
                Pergunta {queueIndex + 1} de {queue.length}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug sm:text-lg">
                {currentKind.gateQuestion.replace(/este produto/gi, "esta categoria").replace(/Esta pizza/gi, categoryName).replace(/Este produto/gi, "Esta categoria")}
              </h3>
              {currentKind.gateHint ? (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{currentKind.gateHint}</p>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                className="h-12 bg-brand hover:brightness-95"
                onClick={() => {
                  if (currentKind.opensComposition) setStep("half");
                  else setStep("library");
                }}
              >
                Sim
              </Button>
              <Button type="button" variant="outline" className="h-12" onClick={() => recordDisabled(currentKind)}>
                Não
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "library" && currentKind && draft ? (
          <motion.div key={`lib-${currentKind.id}`} className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold leading-snug sm:text-lg">
                {currentKind.libraryQuestion}
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Só identidade — preço fica em cada produto.
              </p>
            </div>
            <ul className="space-y-1.5">
              {libraryItems.map((item) => {
                const checked = selectedNames.has(item.name.toLowerCase());
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => toggleLibraryItem(item)}
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
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.fromLibrary ? (
                        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-brand">
                          Base
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => {
                setNewName("");
                setStep("create-item");
              }}
            >
              <Plus className="h-4 w-4" />
              {currentKind.createLabel || "Criar novo"}
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-brand hover:brightness-95"
                disabled={pending}
                onClick={() => void confirmLibrary(currentKind)}
              >
                {pending ? "Salvando…" : "Continuar"}
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "create-item" && currentKind && draft ? (
          <motion.div key="create-item" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold">{currentKind.createLabel || "Nova opção"}</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Entra na base do cardápio — o preço padrão vem no próximo passo.
              </p>
            </div>
            <Input
              value={newName}
              placeholder="Ex.: Família"
              className="h-11"
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              type="button"
              className="bg-brand hover:brightness-95"
              onClick={() => {
                const name = newName.trim();
                if (!name) {
                  setError("Como se chama essa opção?");
                  return;
                }
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        choices: [
                          ...d.choices.filter((c) => c.name.trim().toLowerCase() !== name.toLowerCase()),
                          newChoice(name, 0),
                        ],
                      }
                    : d,
                );
                setNewName("");
                setError(null);
                setStep("library");
              }}
            >
              Adicionar
            </Button>
          </motion.div>
        ) : null}

        {step === "prices" && currentKind ? (
          <motion.div key="prices" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold">
                Quanto custa cada {currentKind.label.replace(/^Possui\s+/i, "").toLowerCase()} normalmente?
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Esse valor vale pra todos os produtos desta categoria — só personaliza no produto se for
                exceção.
              </p>
            </div>
            <ul className="space-y-2">
              {(answers.find((a) => a.kindId === currentKind.id)?.optionNames ?? []).map((name, i) => {
                const answer = answers.find((a) => a.kindId === currentKind.id);
                const price = answer?.optionPrices[i] ?? 0;
                return (
                  <li
                    key={`${name}-${i}`}
                    className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm font-medium">{name}</span>
                    <CurrencyInput
                      value={price}
                      onChange={(value) => {
                        setAnswers((current) =>
                          current.map((a) => {
                            if (a.kindId !== currentKind.id) return a;
                            const optionPrices = [...a.optionPrices];
                            while (optionPrices.length < a.optionIds.length) optionPrices.push(0);
                            optionPrices[i] = value;
                            return { ...a, optionPrices };
                          }),
                        );
                      }}
                    />
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setStep("library")}>
                Voltar
              </Button>
              <Button
                type="button"
                className="bg-brand hover:brightness-95"
                onClick={confirmCategoryPrices}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "half" && currentKind ? (
          <motion.div key="half" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold">Como funciona o meio a meio?</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                O cliente combina sabores no cardápio.
              </p>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Até quantos sabores?</span>
              <Input
                type="number"
                min={2}
                max={4}
                className="h-11 w-28"
                value={halfDraft.max_parts}
                onChange={(e) =>
                  setHalfDraft((h) => ({
                    ...h,
                    max_parts: Math.min(4, Math.max(2, Number(e.target.value) || 2)),
                  }))
                }
              />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-medium">Como cobra?</span>
              <div className="space-y-1.5">
                {HALF_RULES.map((rule) => (
                  <button
                    key={rule.value}
                    type="button"
                    onClick={() => setHalfDraft((h) => ({ ...h, pricing_rule: rule.value }))}
                    className={cn(
                      "flex w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm transition",
                      halfDraft.pricing_rule === rule.value
                        ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                        : "border-[hsl(var(--border))] bg-white",
                    )}
                  >
                    {rule.label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="button"
              className="bg-brand hover:brightness-95"
              onClick={() => confirmHalf(currentKind)}
            >
              Continuar
            </Button>
          </motion.div>
        ) : null}

        {step === "summary" ? (
          <motion.div key="summary" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold sm:text-lg">Resumo</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Confira antes de salvar — vale como padrão dos produtos de {categoryName}.
              </p>
            </div>
            {summaryLines.length ? (
              <ul className="space-y-2 rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))]/40 p-4">
                {summaryLines.map((line) => (
                  <li key={line} className="text-sm font-medium">
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Nada marcado ainda. Volte e responda “Sim” em pelo menos uma pergunta.
              </p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-brand hover:brightness-95"
                disabled={pending || summaryLines.length === 0}
                onClick={confirmSummary}
              >
                {productCount > 0 ? "Continuar" : pending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </motion.div>
        ) : null}

        {step === "apply" ? (
          <motion.div key="apply" className="space-y-4" {...stepMotion}>
            <div>
              <h3 className="text-base font-semibold sm:text-lg">Como deseja aplicar?</h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Esta categoria já tem {productCount} produto{productCount === 1 ? "" : "s"}. Preços e
                escolhas especiais de cada um ficam.
              </p>
            </div>
            <div className="space-y-2">
              {(
                [
                  {
                    value: "new_only" as const,
                    label: "Só nos produtos novos",
                    hint: "Os que já existem continuam como estão.",
                  },
                  {
                    value: "all" as const,
                    label: "Atualizar os produtos que já existem",
                    hint: "Eles passam a seguir o novo jeito (preços ficam).",
                  },
                  {
                    value: "later" as const,
                    label: "Decido depois",
                    hint: "Salva a receita; você aplica quando quiser.",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setApplyMode(opt.value)}
                  className={cn(
                    "flex w-full flex-col rounded-xl border-2 px-3 py-2.5 text-left transition",
                    applyMode === opt.value
                      ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                      : "border-[hsl(var(--border))] bg-white",
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{opt.hint}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setStep("summary")} disabled={pending}>
                Voltar
              </Button>
              <Button
                type="button"
                className="bg-brand hover:brightness-95"
                disabled={pending}
                onClick={() => void saveRecipe(applyMode)}
              >
                {pending ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
