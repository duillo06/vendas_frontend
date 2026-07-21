import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  CategoryAdmin,
  OptionGroupAdmin,
  ProductOptionGroupLink,
} from "@/features/catalog/api/catalogAdminApi";
import { CustomizationAssistant } from "@/features/catalog/components/CustomizationAssistant";
import {
  DEFAULT_COMPOSITION,
  ProductCompositionEditor,
  type CompositionForm,
} from "@/features/catalog/components/ProductCompositionEditor";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { saveCanonicalFromDraft, buildOptionPricesFromDraft, syncProductOptionPrices } from "@/features/catalog/utils/canonicalLibrary";
import {
  summarizeGroup,
  type CustomizationDraft,
} from "@/features/catalog/utils/conversationalOptions";
import { emptyProductLink } from "@/features/catalog/utils/saveCustomization";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type ProductCustomizationsPanelProps = {
  links: ProductOptionGroupLink[];
  availableGroups: OptionGroupAdmin[];
  onChange: (links: ProductOptionGroupLink[]) => void;
  categoryName?: string | null;
  categories?: CategoryAdmin[];
  currentProductId?: string;
  /** preços já salvos neste produto — alimenta o assistente */
  productOptionPrices?: { option_id: string; price: number }[];
  /** acumula preços no form (create) ou atualiza após sync */
  onOptionPricesChange?: (prices: { option_id: string; price: number }[]) => void;
  composition?: CompositionForm;
  onCompositionChange?: (next: CompositionForm) => void;
};

type DialogMode = "closed" | "create" | "edit" | "half";

export function ProductCustomizationsPanel({
  links,
  availableGroups,
  onChange,
  categoryName,
  categories,
  currentProductId,
  productOptionPrices = [],
  onOptionPricesChange,
  composition,
  onCompositionChange,
}: ProductCustomizationsPanelProps) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogMode>("closed");
  const [editingGroup, setEditingGroup] = useState<OptionGroupAdmin | null>(null);
  const [localGroups, setLocalGroups] = useState<OptionGroupAdmin[]>([]);
  const [halfDraft, setHalfDraft] = useState<CompositionForm>(
    () => composition ?? DEFAULT_COMPOSITION,
  );

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

  const halfEnabled = Boolean(composition?.enabled);
  const canHalf = Boolean(onCompositionChange);

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
      const library = existing
        ? mergedGroups.map((g) => (g.id === existing.id ? existing : g))
        : mergedGroups;
      const result = await saveCanonicalFromDraft(
        existing ? { ...draft, name: existing.name || draft.name } : draft,
        library,
      );
      const prices = buildOptionPricesFromDraft(result.group, draft.choices);
      // produto existente: grava preços já; create espera o submit do form
      if (currentProductId && prices.length) {
        await syncProductOptionPrices(currentProductId, prices);
      }
      return { ...result, prices, draft };
    },
    onSuccess: ({ group, reused, prices }, variables) => {
      invalidateGroups();
      setLocalGroups((current) => {
        const without = current.filter((item) => item.id !== group.id);
        return [...without, group];
      });
      if (!attachedIds.has(group.id)) {
        onChange([...links, emptyProductLink(group.id, links.length)]);
      }
      if (prices.length) {
        onOptionPricesChange?.(mergeOptionPrices(productOptionPrices, prices));
      }
      if (variables.existing) {
        toast.success(
          currentProductId
            ? "Atualizado — preços deste produto e itens da biblioteca"
            : "Atualizado na biblioteca",
        );
      } else if (reused) {
        toast.success("Usando a biblioteca da casa neste produto");
      } else {
        toast.success("Salvo na biblioteca e neste produto");
      }
      setDialog("closed");
      setEditingGroup(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Não deu pra salvar. Tente de novo.");
    },
  });

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

  const openHalf = () => {
    setHalfDraft(composition ?? { ...DEFAULT_COMPOSITION, enabled: true });
    setDialog("half");
  };

  const closeDialog = () => {
    setDialog("closed");
    setEditingGroup(null);
  };

  const saveHalf = () => {
    if (!onCompositionChange) return;
    onCompositionChange({ ...halfDraft, enabled: true });
    toast.success("Sabores configurados");
    closeDialog();
  };

  const clearHalf = () => {
    if (!onCompositionChange) return;
    onCompositionChange({ ...DEFAULT_COMPOSITION, enabled: false });
    toast.success("Combinação de sabores removida");
  };

  const hasAnything = links.length > 0 || halfEnabled;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Como você vende este produto?</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Responda perguntas simples — tamanhos, bordas, adicionais. Tudo fica na biblioteca.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Continuar conversa
        </Button>
      </div>

      {!hasAnything ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center">
          <p className="text-sm font-medium">Ainda não perguntamos nada sobre este produto</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Ex.: tem tamanho? borda? adicionais? — só o que fizer sentido.
          </p>
          <Button type="button" className="mt-4 gap-2 bg-brand hover:brightness-95" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Como você vende este produto?
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => {
            const group = groupsById.get(link.option_group_id);
            if (!group) {
              return (
                <li
                  key={link.option_group_id}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm"
                >
                  <span>Item indisponível na biblioteca</span>
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
                className="rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 py-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand" aria-hidden>
                    ✅
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{group.name}</p>
                    <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      {summarizeGroup(group)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1 px-2 text-brand"
                      onClick={() => openEdit(group)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
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
                </div>
              </li>
            );
          })}

          {halfEnabled && canHalf ? (
            <li className="rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 py-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-brand" aria-hidden>
                  ✅
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Cliente pode combinar sabores</p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    Até {composition?.max_parts ?? 2} sabores
                    {composition?.label ? ` · “${composition.label}”` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 px-2 text-brand"
                    onClick={openHalf}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600"
                    onClick={clearHalf}
                    aria-label="Remover combinação de sabores"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ) : null}
        </ul>
      )}

      <Dialog
        open={dialog !== "closed"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        className="max-w-2xl"
      >
        <DialogContent onClose={closeDialog} className="max-h-[min(90vh,760px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialog === "edit"
                ? `Ajustar ${editingGroup?.name ?? "opções"}`
                : dialog === "half"
                  ? "Cliente pode escolher sabores?"
                  : "Como você vende este produto?"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "half"
                ? "Perguntas simples — o cliente combina sabores no cardápio."
                : dialog === "edit"
                  ? "Nome e descrição na biblioteca; o preço vale só neste produto."
                  : "Uma pergunta por vez. Itens entram na biblioteca; preços ficam neste produto."}
            </DialogDescription>
          </DialogHeader>

          {dialog === "create" || dialog === "edit" ? (
            <CustomizationAssistant
              mode={dialog === "edit" ? "edit" : "create"}
              initialGroup={editingGroup}
              availableGroups={mergedGroups}
              attachedIds={attachedIds}
              categoryName={categoryName}
              priceContext="product"
              productOptionPrices={productOptionPrices}
              pending={saveMutation.isPending}
              confirmLabel={dialog === "edit" ? "Salvar" : "Salvar e usar neste produto"}
              onCancel={closeDialog}
              onOpenHalfAndHalf={
                canHalf
                  ? () => {
                      setHalfDraft(
                        composition?.enabled
                          ? composition
                          : { ...DEFAULT_COMPOSITION, enabled: true },
                      );
                      setDialog("half");
                    }
                  : undefined
              }
              onReuse={(group) => {
                if (!attachedIds.has(group.id)) {
                  onChange([...links, emptyProductLink(group.id, links.length)]);
                }
                toast.success(`“${group.name}” da biblioteca vinculado a este produto`);
                closeDialog();
              }}
              onSave={async (draft, existing) => {
                await saveMutation.mutateAsync({ draft, existing });
              }}
            />
          ) : null}

          {dialog === "half" && canHalf ? (
            <div className="space-y-4">
              <ProductCompositionEditor
                value={halfDraft}
                onChange={setHalfDraft}
                categories={categories}
                currentProductId={currentProductId}
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="button" className="bg-brand hover:brightness-95" onClick={saveHalf}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function mergeOptionPrices(
  current: { option_id: string; price: number }[],
  next: { option_id: string; price: number }[],
) {
  const map = new Map(current.map((row) => [row.option_id, row.price]));
  for (const row of next) map.set(row.option_id, row.price);
  return [...map.entries()].map(([option_id, price]) => ({ option_id, price }));
}
