import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  OptionGroupAdmin,
  ProductOptionGroupLink,
} from "@/features/catalog/api/catalogAdminApi";
import { CustomizationAssistant } from "@/features/catalog/components/CustomizationAssistant";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { summarizeGroup } from "@/features/catalog/utils/conversationalOptions";
import {
  createCustomizationFromDraft,
  emptyProductLink,
  updateCustomizationFromDraft,
} from "@/features/catalog/utils/saveCustomization";
import type { CustomizationDraft } from "@/features/catalog/utils/conversationalOptions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

type ProductCustomizationsPanelProps = {
  links: ProductOptionGroupLink[];
  availableGroups: OptionGroupAdmin[];
  onChange: (links: ProductOptionGroupLink[]) => void;
  /** quando true, botão salva diz "Adicionar" — form do produto ainda não persistiu */
  compact?: boolean;
};

type DialogMode = "closed" | "create" | "edit";

export function ProductCustomizationsPanel({
  links,
  availableGroups,
  onChange,
}: ProductCustomizationsPanelProps) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogMode>("closed");
  const [editingGroup, setEditingGroup] = useState<OptionGroupAdmin | null>(null);
  // grupos acabados de criar — até o react-query atualizar a lista
  const [localGroups, setLocalGroups] = useState<OptionGroupAdmin[]>([]);

  const mergedGroups = useMemo(() => {
    const map = new Map<string, OptionGroupAdmin>();
    for (const group of availableGroups) map.set(group.id, group);
    for (const group of localGroups) map.set(group.id, group);
    return [...map.values()];
  }, [availableGroups, localGroups]);

  const groupsById = useMemo(
    () => new Map(mergedGroups.map((group) => [group.id, group])),
    [mergedGroups],
  );

  const attachedIds = useMemo(
    () => new Set(links.map((link) => link.option_group_id)),
    [links],
  );

  const invalidateGroups = () => {
    void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
  };

  const saveMutation = useMutation({
    mutationFn: async ({
      draft,
      existing,
    }: {
      draft: CustomizationDraft;
      existing?: OptionGroupAdmin;
    }) => {
      if (existing) {
        return updateCustomizationFromDraft(existing, draft);
      }
      return createCustomizationFromDraft(draft, availableGroups.length);
    },
    onSuccess: ({ group }, variables) => {
      invalidateGroups();
      setLocalGroups((current) => {
        const without = current.filter((item) => item.id !== group.id);
        return [...without, group];
      });
      if (variables.existing) {
        toast.success("Personalização atualizada");
        setDialog("closed");
        setEditingGroup(null);
        return;
      }
      if (!attachedIds.has(group.id)) {
        onChange([...links, emptyProductLink(group.id, links.length)]);
      }
      toast.success("Personalização adicionada ao produto");
      setDialog("closed");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Não deu pra salvar. Tente de novo.");
    },
  });

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = links.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((link, sortOrder) => ({ ...link, sort_order: sortOrder })));
  };

  const removeLink = (groupId: string) => {
    onChange(
      links
        .filter((link) => link.option_group_id !== groupId)
        .map((link, index) => ({ ...link, sort_order: index })),
    );
  };

  const openCreate = () => {
    setEditingGroup(null);
    setDialog("create");
  };

  const openEdit = (group: OptionGroupAdmin) => {
    setEditingGroup(group);
    setDialog("edit");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Personalizações</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Tamanho, borda, adicionais — o que o cliente escolhe neste produto.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Adicionar personalização
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center">
          <p className="text-sm font-medium">Nenhuma personalização ainda</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Em menos de um minuto você libera tamanho, borda ou adicionais.
          </p>
          <Button type="button" className="mt-4 gap-2 bg-brand hover:brightness-95" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Adicionar personalização
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {links.map((link, index) => {
            const group = groupsById.get(link.option_group_id);
            if (!group) {
              return (
                <li
                  key={link.option_group_id}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm"
                >
                  <span>Personalização indisponível</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => removeLink(link.option_group_id)}
                  >
                    Remover
                  </Button>
                </li>
              );
            }

            return (
              <li
                key={link.option_group_id}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-3",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{group.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {summarizeGroup(group)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    disabled={index === 0}
                    onClick={() => moveLink(index, -1)}
                    aria-label="Subir"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    disabled={index === links.length - 1}
                    onClick={() => moveLink(index, 1)}
                    aria-label="Descer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => openEdit(group)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600"
                    onClick={() => removeLink(link.option_group_id)}
                    aria-label="Remover deste produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={dialog !== "closed"}
        onOpenChange={(open) => {
          if (!open) {
            setDialog("closed");
            setEditingGroup(null);
          }
        }}
        className="max-w-2xl"
      >
        <DialogContent
          onClose={() => {
            setDialog("closed");
            setEditingGroup(null);
          }}
          className="max-h-[min(90vh,720px)] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              {dialog === "edit" ? "Editar personalização" : "Nova personalização"}
            </DialogTitle>
            <DialogDescription>
              Responda as perguntas — o cliente vê o resultado no cardápio.
            </DialogDescription>
          </DialogHeader>

          {dialog !== "closed" ? (
            <CustomizationAssistant
              mode={dialog === "edit" ? "edit" : "create"}
              initialGroup={editingGroup}
              availableGroups={mergedGroups}
              attachedIds={attachedIds}
              pending={saveMutation.isPending}
              onCancel={() => {
                setDialog("closed");
                setEditingGroup(null);
              }}
              onReuse={(group) => {
                if (!attachedIds.has(group.id)) {
                  onChange([...links, emptyProductLink(group.id, links.length)]);
                }
                toast.success(`“${group.name}” vinculada a este produto`);
                setDialog("closed");
              }}
              onSave={async (draft, existing) => {
                await saveMutation.mutateAsync({ draft, existing });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
