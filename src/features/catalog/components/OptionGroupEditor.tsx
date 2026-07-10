import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  catalogAdminApi,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import {
  OptionGroupBuilderFields,
  builderFieldsFromGroup,
  builderFieldsToPayload,
  type BuilderFieldsState,
} from "@/features/catalog/components/OptionGroupBuilderFields";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { UiHint } from "@/shared/components/UiHint";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { adminCopy } from "@/shared/copy/admin";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type OptionSnapshot = {
  id: string;
  name: string;
  price_modifier: number;
  stock_quantity: number | null;
  color: string;
};

type GroupSnapshot = {
  name: string;
  builder: BuilderFieldsState;
  default_option_ids: string[];
  options: OptionSnapshot[];
};

function buildSnapshot(group: OptionGroupAdmin): GroupSnapshot {
  return {
    name: group.name,
    builder: builderFieldsFromGroup(group),
    default_option_ids: group.default_option_ids ?? [],
    options: group.options.map((option) => ({
      id: option.id,
      name: option.name,
      price_modifier: option.price_modifier,
      stock_quantity: option.stock_quantity ?? null,
      color: String((option.metadata as { color?: string } | null)?.color ?? ""),
    })),
  };
}

function isDirty(snapshot: GroupSnapshot, draft: GroupSnapshot): boolean {
  if (snapshot.name !== draft.name) return true;
  if (JSON.stringify(snapshot.builder) !== JSON.stringify(draft.builder)) return true;
  if (JSON.stringify(snapshot.default_option_ids) !== JSON.stringify(draft.default_option_ids)) {
    return true;
  }
  if (snapshot.options.length !== draft.options.length) return true;

  return draft.options.some((option) => {
    const original = snapshot.options.find((item) => item.id === option.id);
    if (!original) return true;
    return (
      original.name !== option.name ||
      original.price_modifier !== option.price_modifier ||
      original.stock_quantity !== option.stock_quantity ||
      original.color !== option.color
    );
  });
}

type OptionGroupEditorProps = {
  group: OptionGroupAdmin;
  allGroups?: OptionGroupAdmin[];
  defaultExpanded?: boolean;
};

export function OptionGroupEditor({
  group,
  allGroups = [],
  defaultExpanded = false,
}: OptionGroupEditorProps) {
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [snapshot, setSnapshot] = useState(() => buildSnapshot(group));
  const [draft, setDraft] = useState(snapshot);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState(0);

  const dirty = useMemo(() => isDirty(snapshot, draft), [snapshot, draft]);

  useEffect(() => {
    const next = buildSnapshot(group);
    setSnapshot(next);
    setDraft(next);
  }, [group.id]);

  useEffect(() => {
    if (dirty) return;
    const next = buildSnapshot(group);
    setSnapshot(next);
    setDraft(next);
  }, [group, dirty]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
  };

  const saveChanges = useMutation({
    mutationFn: async () => {
      const trimmedName = draft.name.trim();
      if (!trimmedName) {
        throw new Error("Informe o nome do grupo");
      }

      const groupPayload = {
        name: trimmedName,
        ...builderFieldsToPayload(draft.builder),
        default_option_ids: draft.default_option_ids,
      };

      if (
        draft.name !== snapshot.name ||
        JSON.stringify(draft.builder) !== JSON.stringify(snapshot.builder)
      ) {
        await catalogAdminApi.updateOptionGroup(group.id, groupPayload);
      }

      for (const option of draft.options) {
        const original = snapshot.options.find((item) => item.id === option.id);
        const trimmedOptionName = option.name.trim();
        if (!trimmedOptionName) {
          throw new Error("Todas as opções precisam de um nome");
        }

        if (
          !original ||
          original.name !== trimmedOptionName ||
          original.price_modifier !== option.price_modifier ||
          original.stock_quantity !== option.stock_quantity ||
          original.color !== option.color
        ) {
          await catalogAdminApi.updateOption(group.id, option.id, {
            name: trimmedOptionName,
            price_modifier: option.price_modifier,
            stock_quantity: option.stock_quantity,
            metadata: option.color.trim() ? { color: option.color.trim() } : null,
          });
        }
      }

      const orderChanged = draft.options.some(
        (option, index) => snapshot.options[index]?.id !== option.id,
      );
      if (orderChanged) {
        await catalogAdminApi.reorderOptions(
          group.id,
          draft.options.map((option) => option.id),
        );
      }
    },
    onSuccess: () => {
      const saved: GroupSnapshot = {
        name: draft.name.trim(),
        builder: draft.builder,
        default_option_ids: draft.default_option_ids,
        options: draft.options.map((option) => ({
          ...option,
          name: option.name.trim(),
        })),
      };
      setSnapshot(saved);
      setDraft(saved);
      toast.success(adminCopy.optionGroups.editor.saved);
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Não foi possível salvar as alterações");
    },
  });

  const deleteGroup = useMutation({
    mutationFn: () => catalogAdminApi.deleteOptionGroup(group.id),
    onSuccess: () => {
      toast.success("Grupo excluído");
      invalidate();
    },
    onError: () => toast.error("Não foi possível excluir o grupo"),
  });

  const duplicateGroup = useMutation({
    mutationFn: () => catalogAdminApi.duplicateOptionGroup(group.id),
    onSuccess: () => {
      toast.success("Grupo duplicado");
      invalidate();
    },
    onError: () => toast.error("Não foi possível duplicar o grupo"),
  });

  const createOption = useMutation({
    mutationFn: () =>
      catalogAdminApi.createOption(group.id, {
        name: newOptionName.trim(),
        price_modifier: newOptionPrice,
        is_active: true,
        is_available: true,
        sort_order: group.options.length,
      }),
    onSuccess: () => {
      toast.success(adminCopy.optionGroups.editor.optionAdded);
      setNewOptionName("");
      setNewOptionPrice(0);
      invalidate();
    },
    onError: () => toast.error("Não foi possível adicionar a opção"),
  });

  const deleteOption = useMutation({
    mutationFn: (optionId: string) => catalogAdminApi.deleteOption(group.id, optionId),
    onSuccess: () => {
      toast.success("Opção excluída");
      invalidate();
    },
    onError: () => toast.error("Não foi possível excluir a opção"),
  });

  const duplicateOption = useMutation({
    mutationFn: (optionId: string) => catalogAdminApi.duplicateOption(group.id, optionId),
    onSuccess: () => {
      toast.success("Opção duplicada");
      invalidate();
    },
    onError: () => toast.error("Não foi possível duplicar a opção"),
  });

  const handleDeleteGroup = async () => {
    const confirmed = await confirm({
      title: "Excluir grupo",
      description: `O grupo "${group.name}" e todas as opções serão removidos. Essa ação não pode ser desfeita.`,
      confirmLabel: "Excluir grupo",
      destructive: true,
    });
    if (confirmed) deleteGroup.mutate();
  };

  const handleDeleteOption = async (optionId: string, optionName: string) => {
    const confirmed = await confirm({
      title: "Excluir opção",
      description: `Remover "${optionName}" deste grupo?`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) deleteOption.mutate(optionId);
  };

  const updateOption = (optionId: string, patch: Partial<OptionSnapshot>) => {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option,
      ),
    }));
  };

  const moveOption = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.options.length) return;
    setDraft((current) => {
      const options = current.options.slice();
      [options[index], options[target]] = [options[target], options[index]];
      return { ...current, options };
    });
  };

  const discardChanges = () => {
    setDraft(snapshot);
  };

  const totalOptions = draft.options.length;
  const hasExtraPrice = draft.options.some((option) => option.price_modifier > 0);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-[hsl(var(--card))] transition-shadow",
        expanded ? "border-[hsl(var(--primary))]/40 shadow-md" : "border-[hsl(var(--border))] shadow-sm",
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[hsl(var(--muted))]/40 sm:px-5"
        onClick={() => setExpanded((current) => !current)}
      >
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform",
            expanded && "rotate-180",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold">{group.name}</h2>
            {dirty ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Não salvo
              </span>
            ) : null}
            {group.is_required ? (
              <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
                Obrigatório
              </span>
            ) : null}
            {group.display_type ? (
              <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                {group.display_type}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            {totalOptions} {totalOptions === 1 ? "opção" : "opções"}
            {hasExtraPrice ? " · com acréscimos" : ""}
          </p>
        </div>
      </button>

      {expanded ? (
        <div className="space-y-5 border-t border-[hsl(var(--border))] px-4 py-5 sm:px-5">
          {dirty ? (
            <UiHint tone="warm">{adminCopy.optionGroups.editor.saveReminder}</UiHint>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`group-name-${group.id}`}>Nome do grupo</Label>
            <Input
              id={`group-name-${group.id}`}
              value={draft.name}
              placeholder="Ex: Tamanho, Borda, Adicionais"
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>

          <OptionGroupBuilderFields
            idPrefix={`group-${group.id}`}
            value={draft.builder}
            currentGroupId={group.id}
            availableGroups={allGroups}
            onChange={(patch) =>
              setDraft((current) => ({
                ...current,
                builder: { ...current.builder, ...patch },
              }))
            }
          />

          {draft.options.length ? (
            <div className="space-y-2">
              <Label>Pré-seleção padrão</Label>
              <div className="flex flex-wrap gap-3">
                {draft.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[hsl(var(--primary))]"
                      checked={draft.default_option_ids.includes(option.id)}
                      onChange={(event) => {
                        setDraft((current) => ({
                          ...current,
                          default_option_ids: event.target.checked
                            ? [...current.default_option_ids, option.id]
                            : current.default_option_ids.filter((id) => id !== option.id),
                        }));
                      }}
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <UiHint tone="neutral" className="text-xs">
            {adminCopy.optionGroups.editor.requiredHelp}
          </UiHint>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Opções do grupo</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {adminCopy.optionGroups.editor.priceHelp}
                </p>
              </div>
            </div>

            {draft.options.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {adminCopy.optionGroups.editor.optionsEmpty}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))] overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                <li className="hidden bg-[hsl(var(--muted))]/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:grid sm:grid-cols-[auto_1fr_7rem_7rem_6rem_auto] sm:gap-3">
                  <span>Ordem</span>
                  <span>Nome</span>
                  <span>Acréscimo</span>
                  <span>Estoque</span>
                  <span>Cor</span>
                  <span className="sr-only">Ações</span>
                </li>
                {draft.options.map((option, index) => (
                  <li
                    key={option.id}
                    className="grid gap-3 p-3 sm:grid-cols-[auto_1fr_7rem_7rem_6rem_auto] sm:items-center"
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={index === 0}
                        onClick={() => moveOption(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={index === draft.options.length - 1}
                        onClick={() => moveOption(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs sm:sr-only" htmlFor={`option-name-${option.id}`}>
                        Nome
                      </Label>
                      <Input
                        id={`option-name-${option.id}`}
                        value={option.name}
                        placeholder="Nome da opção"
                        onChange={(event) => updateOption(option.id, { name: event.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs sm:sr-only" htmlFor={`option-price-${option.id}`}>
                        Acréscimo
                      </Label>
                      <CurrencyInput
                        id={`option-price-${option.id}`}
                        value={option.price_modifier}
                        onChange={(value) => updateOption(option.id, { price_modifier: value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs sm:sr-only" htmlFor={`option-stock-${option.id}`}>
                        Estoque
                      </Label>
                      <Input
                        id={`option-stock-${option.id}`}
                        type="number"
                        min={0}
                        placeholder="∞"
                        value={option.stock_quantity ?? ""}
                        onChange={(event) =>
                          updateOption(option.id, {
                            stock_quantity: event.target.value
                              ? Number(event.target.value)
                              : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs sm:sr-only" htmlFor={`option-color-${option.id}`}>
                        Cor
                      </Label>
                      <Input
                        id={`option-color-${option.id}`}
                        placeholder="#hex"
                        value={option.color}
                        onChange={(event) => updateOption(option.id, { color: event.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        aria-label={`Duplicar ${option.name}`}
                        disabled={duplicateOption.isPending}
                        onClick={() => duplicateOption.mutate(option.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-[hsl(var(--muted-foreground))] hover:text-red-600"
                        aria-label={`Excluir ${option.name}`}
                        disabled={deleteOption.isPending}
                        onClick={() => handleDeleteOption(option.id, option.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-4">
            <p className="mb-3 text-sm font-medium">Nova opção</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
              <div className="space-y-1">
                <Label htmlFor={`new-option-${group.id}`}>Nome</Label>
                <Input
                  id={`new-option-${group.id}`}
                  placeholder="Ex: Grande"
                  value={newOptionName}
                  onChange={(event) => setNewOptionName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && newOptionName.trim()) {
                      event.preventDefault();
                      createOption.mutate();
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`new-option-price-${group.id}`}>Acréscimo</Label>
                <CurrencyInput
                  id={`new-option-price-${group.id}`}
                  value={newOptionPrice}
                  onChange={setNewOptionPrice}
                />
              </div>
              <Button
                type="button"
                className="gap-2"
                disabled={!newOptionName.trim() || createOption.isPending}
                onClick={() => createOption.mutate()}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
            {newOptionPrice > 0 ? (
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                Será adicionado {formatCurrency(newOptionPrice)} ao preço do produto
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[hsl(var(--border))] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={deleteGroup.isPending}
                onClick={handleDeleteGroup}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir grupo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                disabled={duplicateGroup.isPending}
                onClick={() => duplicateGroup.mutate()}
              >
                <Copy className="h-4 w-4" />
                Duplicar grupo
              </Button>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              {dirty ? (
                <Button type="button" variant="outline" onClick={discardChanges}>
                  Descartar
                </Button>
              ) : null}
              <Button
                type="button"
                className="gap-2"
                disabled={!dirty || saveChanges.isPending || !draft.name.trim()}
                onClick={() => saveChanges.mutate()}
              >
                <Save className="h-4 w-4" />
                {saveChanges.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
