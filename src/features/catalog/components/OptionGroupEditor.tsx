import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  catalogAdminApi,
  type OptionGroupAdmin,
} from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { formatCurrency } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type OptionSnapshot = {
  id: string;
  name: string;
  price_modifier: number;
};

type GroupSnapshot = {
  name: string;
  is_required: boolean;
  options: OptionSnapshot[];
};

function buildSnapshot(group: OptionGroupAdmin): GroupSnapshot {
  return {
    name: group.name,
    is_required: group.is_required,
    options: group.options.map((option) => ({
      id: option.id,
      name: option.name,
      price_modifier: option.price_modifier,
    })),
  };
}

function isDirty(snapshot: GroupSnapshot, draft: GroupSnapshot): boolean {
  if (snapshot.name !== draft.name || snapshot.is_required !== draft.is_required) {
    return true;
  }

  if (snapshot.options.length !== draft.options.length) {
    return true;
  }

  return draft.options.some((option) => {
    const original = snapshot.options.find((item) => item.id === option.id);
    if (!original) return true;
    return original.name !== option.name || original.price_modifier !== option.price_modifier;
  });
}

type OptionGroupEditorProps = {
  group: OptionGroupAdmin;
  defaultExpanded?: boolean;
};

export function OptionGroupEditor({ group, defaultExpanded = false }: OptionGroupEditorProps) {
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

      if (draft.name !== snapshot.name || draft.is_required !== snapshot.is_required) {
        await catalogAdminApi.updateOptionGroup(group.id, {
          name: trimmedName,
          is_required: draft.is_required,
          min_selections: draft.is_required ? 1 : 0,
        });
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
          original.price_modifier !== option.price_modifier
        ) {
          await catalogAdminApi.updateOption(group.id, option.id, {
            name: trimmedOptionName,
            price_modifier: option.price_modifier,
          });
        }
      }
    },
    onSuccess: () => {
      const saved: GroupSnapshot = {
        name: draft.name.trim(),
        is_required: draft.is_required,
        options: draft.options.map((option) => ({
          ...option,
          name: option.name.trim(),
        })),
      };
      setSnapshot(saved);
      setDraft(saved);
      toast.success("Alterações salvas");
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
      toast.success("Opção adicionada");
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
          </div>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            {totalOptions} {totalOptions === 1 ? "opção" : "opções"}
            {hasExtraPrice ? " · com acréscimos" : ""}
          </p>
        </div>
      </button>

      {expanded ? (
        <div className="space-y-5 border-t border-[hsl(var(--border))] px-4 py-5 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[hsl(var(--border))] px-4 py-3 sm:min-w-52">
              <div>
                <p className="text-sm font-medium">Seleção obrigatória</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Cliente precisa escolher
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 accent-[hsl(var(--primary))]"
                checked={draft.is_required}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, is_required: event.target.checked }))
                }
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">Opções do grupo</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Valor em branco ou R$ 0,00 = sem acréscimo no produto
                </p>
              </div>
            </div>

            {draft.options.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Nenhuma opção cadastrada ainda.
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Adicione opções como Pequena, Média, Grande...
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--border))] overflow-hidden rounded-lg border border-[hsl(var(--border))]">
                <li className="hidden bg-[hsl(var(--muted))]/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))] sm:grid sm:grid-cols-[1fr_9rem_2.5rem] sm:gap-3">
                  <span>Nome</span>
                  <span>Acréscimo</span>
                  <span className="sr-only">Ações</span>
                </li>
                {draft.options.map((option) => (
                  <li
                    key={option.id}
                    className="grid gap-3 p-3 sm:grid-cols-[1fr_9rem_2.5rem] sm:items-center"
                  >
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
