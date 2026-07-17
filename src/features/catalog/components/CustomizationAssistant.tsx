import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import type { OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import {
  CUSTOMIZATION_TEMPLATES,
  applyMaxSelections,
  applyRequired,
  applySelectionType,
  buildPreviewLines,
  draftFromGroup,
  draftFromTemplate,
  emptyDraft,
  findReusableGroups,
  newChoice,
  validateDraft,
  type CustomizationDraft,
  type CustomizationTemplate,
} from "@/features/catalog/utils/conversationalOptions";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type Mode = "create" | "edit" | "reuse-pick";

type CustomizationAssistantProps = {
  mode?: Mode;
  initialGroup?: OptionGroupAdmin | null;
  availableGroups?: OptionGroupAdmin[];
  /** ids já vinculados neste produto — não sugerir de novo */
  attachedIds?: Set<string>;
  onCancel: () => void;
  onSave: (draft: CustomizationDraft, existingGroup?: OptionGroupAdmin) => void | Promise<void>;
  onReuse?: (group: OptionGroupAdmin) => void | Promise<void>;
  pending?: boolean;
  confirmLabel?: string;
};

type Step =
  | "template"
  | "reuse"
  | "name"
  | "selection"
  | "required"
  | "max"
  | "choices";

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
  onCancel,
  onSave,
  onReuse,
  pending,
  confirmLabel,
}: CustomizationAssistantProps) {
  const isEdit = mode === "edit" && !!initialGroup;
  const saveLabel =
    confirmLabel ?? (isEdit ? "Salvar alterações" : "Adicionar ao produto");

  const [template, setTemplate] = useState<CustomizationTemplate | null>(null);
  const [draft, setDraft] = useState<CustomizationDraft>(() =>
    initialGroup ? draftFromGroup(initialGroup) : emptyDraft(),
  );
  const [step, setStep] = useState<Step>(isEdit ? "name" : "template");
  const [error, setError] = useState<string | null>(null);

  const reusable = useMemo(() => {
    if (!template) return [];
    return findReusableGroups(availableGroups, template, attachedIds);
  }, [template, availableGroups, attachedIds]);

  const suggestions = template?.suggestions ?? [];
  const usedNames = new Set(draft.choices.map((c) => c.name.toLowerCase()));
  const availableSuggestions = suggestions.filter((s) => !usedNames.has(s.toLowerCase()));

  const preview = buildPreviewLines(draft);

  const pickTemplate = (next: CustomizationTemplate) => {
    setTemplate(next);
    setDraft(draftFromTemplate(next));
    setError(null);
    const matches = findReusableGroups(availableGroups, next, attachedIds);
    if (matches.length > 0 && onReuse) {
      setStep("reuse");
      return;
    }
    setStep(next.id === "other" ? "name" : "selection");
  };

  const goNextFromName = () => {
    if (!draft.name.trim()) {
      setError("Como vamos chamar essa escolha no cardápio?");
      return;
    }
    setError(null);
    setStep("selection");
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

  return (
    <div className="space-y-6">
      {step !== "template" && step !== "reuse" ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground"
          onClick={() => {
            setError(null);
            if (isEdit) {
              onCancel();
              return;
            }
            if (step === "name") {
              setStep(reusable.length && template && onReuse ? "reuse" : "template");
            } else if (step === "selection") {
              setStep(template && template.id !== "other" && draft.name === template.name ? (reusable.length && onReuse ? "reuse" : "template") : "name");
            } else if (step === "required") setStep("selection");
            else if (step === "max") setStep("required");
            else if (step === "choices") {
              setStep(draft.selection_type === "multiple" ? "max" : "required");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      ) : null}

      <AnimatePresence mode="wait">
        {step === "template" ? (
          <motion.div key="template" {...stepMotion}>
            <QuestionBlock
              title="O que o cliente pode personalizar?"
              description="Escolha um atalho — ou monte algo do zero."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {CUSTOMIZATION_TEMPLATES.map((item) => (
                  <OptionCard
                    key={item.id}
                    emoji={item.emoji}
                    label={item.label}
                    description={
                      item.id === "other"
                        ? "Massa, ponto da carne, bebida…"
                        : item.description || undefined
                    }
                    selected={false}
                    onSelect={() => pickTemplate(item)}
                  />
                ))}
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "reuse" && template ? (
          <motion.div key="reuse" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title={`Você já tem “${template.name}” salva`}
              description="Pode reutilizar no produto ou criar uma nova."
            >
              <div className="space-y-2">
                {reusable.map((group) => (
                  <OptionCard
                    key={group.id}
                    label={group.name}
                    description={`${group.options.length || group.options_count} escolhas`}
                    selected={false}
                    onSelect={() => onReuse?.(group)}
                  />
                ))}
                <OptionCard
                  label="Criar uma nova"
                  description="Com nome e escolhas diferentes."
                  selected={false}
                  onSelect={() => setStep(template.id === "other" ? "name" : "name")}
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
                placeholder="Ex.: Borda recheada"
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

        {step === "selection" ? (
          <motion.div key="selection" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title="O cliente escolhe uma opção ou pode escolher várias?"
              description="Ex.: tamanho = uma. Adicionais = várias."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <OptionCard
                  label="Só uma"
                  description="Tamanho, massa, ponto…"
                  selected={draft.selection_type === "single"}
                  onSelect={() => {
                    setDraft((d) => applySelectionType(d, "single"));
                    setStep("required");
                  }}
                />
                <OptionCard
                  label="Várias"
                  description="Adicionais, molhos, extras…"
                  selected={draft.selection_type === "multiple"}
                  onSelect={() => {
                    setDraft((d) => applySelectionType(d, "multiple"));
                    setStep("required");
                  }}
                />
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "required" ? (
          <motion.div key="required" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title="Ele é obrigado a escolher?"
              description="Se sim, o pedido só segue depois dessa escolha."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <OptionCard
                  label="Não"
                  description="Pode pular se quiser."
                  selected={!draft.is_required}
                  onSelect={() => {
                    setDraft((d) => applyRequired(d, false));
                    setStep(draft.selection_type === "multiple" ? "max" : "choices");
                  }}
                />
                <OptionCard
                  label="Sim"
                  description="Ex.: precisa escolher o tamanho."
                  selected={draft.is_required}
                  onSelect={() => {
                    setDraft((d) => applyRequired(d, true));
                    setStep(draft.selection_type === "multiple" ? "max" : "choices");
                  }}
                />
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "max" ? (
          <motion.div key="max" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title="Quantas opções ele pode escolher?"
              description="Limite o que faz sentido na cozinha."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {[2, 3, 5].map((n) => (
                  <OptionCard
                    key={n}
                    label={`Até ${n}`}
                    selected={draft.max_selections === n}
                    onSelect={() => {
                      setDraft((d) => applyMaxSelections(d, n));
                      setStep("choices");
                    }}
                  />
                ))}
                <OptionCard
                  label="Sem limite"
                  description="Pode marcar todas."
                  selected={draft.max_selections === 0}
                  onSelect={() => {
                    setDraft((d) => applyMaxSelections(d, 0));
                    setStep("choices");
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Outro:</span>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  className="h-11 w-24 text-center"
                  value={draft.max_selections > 0 ? draft.max_selections : ""}
                  placeholder="—"
                  onChange={(e) =>
                    setDraft((d) => applyMaxSelections(d, Number(e.target.value) || 1))
                  }
                />
                <Button type="button" variant="outline" onClick={() => setStep("choices")}>
                  Continuar
                </Button>
              </div>
            </QuestionBlock>
          </motion.div>
        ) : null}

        {step === "choices" ? (
          <motion.div key="choices" className="space-y-4" {...stepMotion}>
            <QuestionBlock
              title="Quais escolhas você oferece?"
              description="Nome + preço. Deixe R$ 0,00 se não muda o valor."
            >
              {availableSuggestions.length ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {availableSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-1 text-sm font-medium text-brand transition hover:bg-[hsl(var(--muted))]/50"
                      onClick={() =>
                        setDraft((d) => ({ ...d, choices: [...d.choices, newChoice(suggestion)] }))
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {draft.choices.map((choice) => (
                    <motion.div
                      key={choice.key}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white p-2"
                    >
                      <Input
                        value={choice.name}
                        placeholder="Nome da escolha"
                        className="flex-1"
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            choices: d.choices.map((c) =>
                              c.key === choice.key ? { ...c, name: e.target.value } : c,
                            ),
                          }))
                        }
                      />
                      <div className="w-28 shrink-0">
                        <CurrencyInput
                          value={choice.price}
                          onChange={(value) =>
                            setDraft((d) => ({
                              ...d,
                              choices: d.choices.map((c) =>
                                c.key === choice.key ? { ...c, price: value } : c,
                              ),
                            }))
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-red-600"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            choices: d.choices.filter((c) => c.key !== choice.key),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Button
                type="button"
                variant="outline"
                className="mt-2 gap-1"
                onClick={() => setDraft((d) => ({ ...d, choices: [...d.choices, newChoice()] }))}
              >
                <Plus className="h-4 w-4" />
                Adicionar escolha
              </Button>
            </QuestionBlock>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {step !== "template" && step !== "reuse" ? (
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

      {step === "choices" ? (
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
      ) : step === "template" || step === "reuse" ? (
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
