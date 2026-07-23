import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Plus, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import type { OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import {
  PERSONALIZATION_KINDS,
  buildLibraryItems,
  buildPreviewLines,
  draftFromGroup,
  draftFromKind,
  emptyDraft,
  findReusableGroups,
  kindById,
  newChoice,
  suggestedKindIds,
  validateDraft,
  type CustomizationDraft,
  type LibraryItem,
  type PersonalizationKind,
} from "@/features/catalog/utils/conversationalOptions";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type Mode = "create" | "edit";

type CustomizationAssistantProps = {
  mode?: Mode;
  initialGroup?: OptionGroupAdmin | null;
  availableGroups?: OptionGroupAdmin[];
  /** ids já vinculados neste produto — não sugerir de novo */
  attachedIds?: Set<string>;
  /** categoria do produto — destaca cartões relevantes */
  categoryName?: string | null;
  /** product = preço neste produto; catalog = só identidade na base */
  priceContext?: "product" | "catalog";
  productOptionPrices?: { option_id: string; price: number }[];
  onCancel: () => void;
  onSave: (draft: CustomizationDraft, existingGroup?: OptionGroupAdmin) => void | Promise<void>;
  onReuse?: (group: OptionGroupAdmin) => void | Promise<void>;
  /** meio a meio — abre o assistente de sabores */
  onOpenHalfAndHalf?: () => void;
  pending?: boolean;
  confirmLabel?: string;
};

type Step = "hub" | "gate" | "reuse" | "library" | "create-item" | "name";

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export function CustomizationAssistant({
  mode = "create",
  initialGroup = null,
  availableGroups = [],
  attachedIds = new Set(),
  categoryName,
  priceContext = "product",
  productOptionPrices = [],
  onCancel,
  onSave,
  onReuse,
  onOpenHalfAndHalf,
  pending,
  confirmLabel,
}: CustomizationAssistantProps) {
  const isEdit = mode === "edit" && !!initialGroup;
  const showPrice = priceContext === "product";
  const saveLabel =
    confirmLabel ?? (isEdit ? "Salvar alterações" : "Adicionar ao produto");

  const priceByOptionId = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of productOptionPrices) map.set(row.option_id, row.price);
    return map;
  }, [productOptionPrices]);

  const [kind, setKind] = useState<PersonalizationKind | null>(() => {
    if (!initialGroup) return null;
    const inferred = kindById(draftFromGroup(initialGroup).kindId ?? "other");
    return inferred ?? kindById("other") ?? null;
  });
  const [draft, setDraft] = useState<CustomizationDraft>(() =>
    initialGroup
      ? draftFromGroup(initialGroup, Object.fromEntries(
          productOptionPrices.map((r) => [r.option_id, r.price]),
        ))
      : emptyDraft(),
  );
  const [step, setStep] = useState<Step>(isEdit ? "library" : "hub");
  const [error, setError] = useState<string | null>(null);

  // formulário rápido de novo item
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newDescription, setNewDescription] = useState("");

  const recommended = useMemo(() => suggestedKindIds(categoryName), [categoryName]);

  const reusable = useMemo(() => {
    if (!kind || kind.opensComposition) return [];
    return findReusableGroups(availableGroups, kind, attachedIds);
  }, [kind, availableGroups, attachedIds]);

  const libraryItems = useMemo(() => {
    if (!kind || kind.opensComposition) return [];
    const base = buildLibraryItems(availableGroups, kind, new Set());
    const byName = new Map(base.map((item) => [item.name.toLowerCase(), item]));
    // itens acabados de criar no rascunho — precisam aparecer pra desmarcar
    for (const choice of draft.choices) {
      const name = choice.name.trim();
      if (!name) continue;
      const needle = name.toLowerCase();
      if (byName.has(needle)) continue;
      byName.set(needle, {
        key: choice.key,
        name,
        price: choice.price,
        description: choice.description || undefined,
        fromLibrary: false,
      });
    }
    return [...byName.values()];
  }, [kind, availableGroups, draft.choices]);

  const selectedNames = useMemo(
    () => new Set(draft.choices.map((c) => c.name.trim().toLowerCase()).filter(Boolean)),
    [draft.choices],
  );

  const preview = buildPreviewLines(draft);

  const pickKind = (next: PersonalizationKind) => {
    setError(null);
    if (next.opensComposition) {
      onOpenHalfAndHalf?.();
      return;
    }
    setKind(next);
    setDraft(draftFromKind(next));
    setStep("gate");
  };

  const answerGate = (yes: boolean) => {
    if (!kind) return;
    if (!yes) {
      setKind(null);
      setDraft(emptyDraft());
      setStep("hub");
      return;
    }
    // personalização livre — precisa do nome primeiro
    if (kind.id === "other") {
      setStep("name");
      return;
    }
    if (reusable.length > 0 && onReuse) {
      setStep("reuse");
      return;
    }
    setStep("library");
  };

  const goLibrary = () => {
    setError(null);
    setStep("library");
  };

  const toggleLibraryItem = (item: LibraryItem) => {
    const needle = item.name.toLowerCase();
    setDraft((d) => {
      const exists = d.choices.some((c) => c.name.trim().toLowerCase() === needle);
      if (exists) {
        return { ...d, choices: d.choices.filter((c) => c.name.trim().toLowerCase() !== needle) };
      }
      const price = (item.optionId && priceByOptionId.get(item.optionId)) ?? 0;
      return {
        ...d,
        choices: [...d.choices, newChoice(item.name, price, item.description ?? "")],
      };
    });
  };

  const saveNewItem = () => {
    const name = newName.trim();
    if (!name) {
      setError("Como se chama essa opção?");
      return;
    }
    setError(null);
    setDraft((d) => {
      const without = d.choices.filter((c) => c.name.trim().toLowerCase() !== name.toLowerCase());
      return { ...d, choices: [...without, newChoice(name, newPrice, newDescription.trim())] };
    });
    setNewName("");
    setNewPrice(0);
    setNewDescription("");
    setStep("library");
  };

  const goNextFromName = () => {
    if (!draft.name.trim()) {
      setError("Como vamos chamar essa escolha no cardápio?");
      return;
    }
    setError(null);
    setStep("library");
  };

  const finish = async () => {
    const check = validateDraft(draft);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setError(null);
    await onSave(draft, initialGroup ?? undefined);
  };

  const goBack = () => {
    setError(null);
    if (isEdit) {
      onCancel();
      return;
    }
    if (step === "create-item") {
      setStep("library");
      return;
    }
    if (step === "library" || step === "name") {
      if (kind?.id === "other" && step === "library") {
        setStep("name");
        return;
      }
      if (reusable.length && onReuse && kind) {
        setStep("reuse");
        return;
      }
      setStep("gate");
      return;
    }
    if (step === "reuse") {
      setStep("gate");
      return;
    }
    if (step === "gate") {
      setKind(null);
      setDraft(emptyDraft());
      setStep("hub");
    }
  };

  const hubKinds = PERSONALIZATION_KINDS.filter((k) => {
    if (k.opensComposition && !onOpenHalfAndHalf) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {step !== "hub" ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {step === "hub" ? (
          <motion.div key="hub" {...stepMotion}>
            <QuestionBlock
              title="Como seus clientes podem personalizar este produto?"
              description="Toque no que faz sentido — o resto você ignora."
            >
              {recommended.length > 0 && categoryName ? (
                <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  Sugestões pra {categoryName}
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {hubKinds.map((item) => {
                  const highlighted = recommended.includes(item.id);
                  return (
                    <HubCard
                      key={item.id}
                      emoji={item.emoji}
                      label={item.label}
                      example={item.example}
                      highlighted={highlighted}
                      onSelect={() => pickKind(item)}
                    />
                  );
                })}
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "gate" && kind ? (
          <motion.div key="gate" {...stepMotion}>
            <QuestionBlock title={kind.gateQuestion} description={kind.gateHint}>
              <div className="grid gap-2 sm:grid-cols-2">
                <OptionCard label="Sim" selected={false} onSelect={() => answerGate(true)} />
                <OptionCard
                  label="Não"
                  description="Voltar às opções"
                  selected={false}
                  onSelect={() => answerGate(false)}
                />
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "reuse" && kind ? (
          <motion.div key="reuse" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title={`Você já tem “${kind.groupName || kind.label}” na biblioteca`}
              description="Reaproveite no produto ou monte uma combinação nova."
            >
              <div className="space-y-2">
                {reusable.map((group) => (
                  <OptionCard
                    key={group.id}
                    label={group.name}
                    description={
                      group.options.length
                        ? group.options
                            .slice(0, 4)
                            .map((o) => o.name)
                            .join(", ")
                        : `${group.options_count} escolhas`
                    }
                    selected={false}
                    onSelect={() => onReuse?.(group)}
                  />
                ))}
                <OptionCard
                  label="Escolher ou criar opções"
                  description="Marcar da biblioteca ou criar novas."
                  selected={false}
                  onSelect={goLibrary}
                />
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "name" ? (
          <motion.div key="name" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title="Como vamos chamar essa escolha?"
              description="É o título que o cliente vê no cardápio."
            >
              <Input
                value={draft.name}
                placeholder="Ex.: Ponto da carne"
                className="h-11"
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                autoFocus
              />
              <Input
                value={draft.description}
                placeholder="Texto de ajuda (opcional)"
                className="mt-2 h-11"
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
              <Button type="button" className="mt-3 bg-brand hover:brightness-95" onClick={goNextFromName}>
                Continuar
              </Button>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "library" && kind ? (
          <motion.div key="library" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title={kind.libraryQuestion || "Quais opções deseja oferecer?"}
              description={
                isEdit
                  ? showPrice
                    ? "Nome na biblioteca; preço só neste produto."
                    : "Só identidade — sem preço na base do cardápio."
                  : kind.libraryHint
              }
            >
              <ul className="space-y-1.5">
                {libraryItems.map((item) => {
                  const checked = selectedNames.has(item.name.toLowerCase());
                  const hintPrice =
                    (item.optionId && priceByOptionId.get(item.optionId)) ?? null;
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
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{item.name}</span>
                          {showPrice && hintPrice != null && hintPrice > 0 ? (
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                              +{hintPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
                              neste produto
                            </span>
                          ) : null}
                        </span>
                        {item.fromLibrary ? (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-brand">
                            Biblioteca
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {showPrice && draft.choices.some((c) => c.name.trim()) ? (
                <div className="mt-4 space-y-2 rounded-xl border border-[hsl(var(--border))] bg-white p-3">
                  <p className="text-sm font-medium">Preços neste produto</p>
                  <ul className="space-y-2">
                    {draft.choices
                      .filter((c) => c.name.trim())
                      .map((choice) => (
                        <li
                          key={choice.key}
                          className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm">{choice.name}</span>
                          <CurrencyInput
                            value={choice.price}
                            onChange={(price) =>
                              setDraft((d) => ({
                                ...d,
                                choices: d.choices.map((c) =>
                                  c.key === choice.key ? { ...c, price } : c,
                                ),
                              }))
                            }
                          />
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full gap-2 sm:w-auto"
                onClick={() => {
                  setNewName("");
                  setNewPrice(0);
                  setNewDescription("");
                  setError(null);
                  setStep("create-item");
                }}
              >
                <Plus className="h-4 w-4" />
                {kind.createLabel || "Criar novo"}
              </Button>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "create-item" && kind ? (
          <motion.div key="create-item" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title={kind.createLabel || "Nova opção"}
              description={
                showPrice
                  ? "Nome na biblioteca; o preço vale só neste produto."
                  : "Só o nome — preço você define depois em cada produto."
              }
            >
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Nome</span>
                <Input
                  value={newName}
                  placeholder="Ex.: Família"
                  className="h-11"
                  autoFocus
                  onChange={(e) => setNewName(e.target.value)}
                />
              </label>
              {showPrice ? (
                <label className="mt-3 block space-y-1.5">
                  <span className="text-sm font-medium">Preço neste produto</span>
                  <CurrencyInput value={newPrice} onChange={setNewPrice} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Zero se não altera o valor do produto.
                  </span>
                </label>
              ) : null}
              <label className="mt-3 block space-y-1.5">
                <span className="text-sm font-medium">Descrição (opcional)</span>
                <Input
                  value={newDescription}
                  placeholder="Curta, se quiser"
                  className="h-11"
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </label>
              <Button type="button" className="mt-4 bg-brand hover:brightness-95" onClick={saveNewItem}>
                Incluir na lista
              </Button>
            </QuestionBlock>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {step === "library" || step === "create-item" ? (
        <motion.div
          layout
          className="rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))]/40 p-4 sm:p-5"
        >
          <p className="text-sm font-semibold">✨ Assim ficará para seu cliente</p>
          <div className="mt-2 space-y-1.5">
            {preview.map((line) => (
              <p key={line} className="text-sm text-[hsl(var(--foreground))]/90">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {step === "library" ? (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-brand hover:brightness-95"
            onClick={() => void finish()}
            disabled={pending}
          >
            {pending ? "Salvando…" : saveLabel}
          </Button>
        </div>
      ) : step === "hub" || step === "reuse" || step === "gate" ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
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
        <h3 className="text-base font-semibold leading-snug tracking-tight sm:text-lg">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function HubCard({
  emoji,
  label,
  example,
  highlighted,
  onSelect,
}: {
  emoji: string;
  label: string;
  example: string;
  highlighted?: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "flex min-h-[7.5rem] flex-col items-start gap-1.5 rounded-2xl border-2 p-3.5 text-left transition-colors sm:min-h-[8.5rem]",
        highlighted
          ? "border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary-soft))]/70 shadow-sm"
          : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--muted))]/35",
      )}
    >
      <span className="text-3xl sm:text-4xl">{emoji}</span>
      <span className="text-sm font-semibold leading-snug">{label}</span>
      <span className="text-xs leading-snug text-[hsl(var(--muted-foreground))]">
        Ex.: {example}
      </span>
    </motion.button>
  );
}

function OptionCard({
  label,
  description,
  emoji,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  emoji?: string;
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
      {emoji ? <span className="text-xl">{emoji}</span> : null}
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
