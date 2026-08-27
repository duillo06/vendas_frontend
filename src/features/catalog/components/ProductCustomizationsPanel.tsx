import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  CategoryAdmin,
  OptionGroupAdmin,
  ProductOptionGroupLink,
} from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { CustomizationAssistant } from "@/features/catalog/components/CustomizationAssistant";
import {
  DEFAULT_COMPOSITION,
  ProductCompositionEditor,
  type CompositionForm,
} from "@/features/catalog/components/ProductCompositionEditor";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { saveCanonicalFromDraft, buildOptionPricesFromDraft, mergeExclusionsForGroup, replaceGroupOptionPrices, resolveSelectedOptionIds } from "@/features/catalog/utils/canonicalLibrary";
import {
  summarizeGroup,
  type CustomizationDraft,
} from "@/features/catalog/utils/conversationalOptions";
import { serializeProductLinks } from "@/features/catalog/utils/productLinks";
import { emptyProductLink } from "@/features/catalog/utils/saveCustomization";
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
  categoryName?: string | null;
  categories?: CategoryAdmin[];
  currentProductId?: string;
  /** preços já salvos neste produto — alimenta o assistente */
  productOptionPrices?: { option_id: string; price: number }[];
  /** acumula preços no form (create) ou atualiza após sync */
  onOptionPricesChange?: (prices: { option_id: string; price: number }[]) => void;
  /** opções da biblioteca que este produto NÃO oferece */
  productOptionExclusions?: string[];
  onOptionExclusionsChange?: (ids: string[]) => void;
  composition?: CompositionForm;
  onCompositionChange?: (next: CompositionForm) => void;
  /**
   * painel no lugar de dialog — evita <dialog> aninhado (fecha o fluxo pai no Chromium)
   * use dentro de IntentFlowDialog
   */
  assistantPresentation?: "dialog" | "panel";
  /** avisa o fluxo pai pra esconder o Salvar de fora (dois botões confundem) */
  onAssistantOpenChange?: (open: boolean) => void;
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
  productOptionExclusions = [],
  onOptionExclusionsChange,
  composition,
  onCompositionChange,
  assistantPresentation = "dialog",
  onAssistantOpenChange,
}: ProductCustomizationsPanelProps) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<DialogMode>("closed");
  const [editingGroup, setEditingGroup] = useState<OptionGroupAdmin | null>(null);
  const [localGroups, setLocalGroups] = useState<OptionGroupAdmin[]>([]);
  const [halfDraft, setHalfDraft] = useState<CompositionForm>(
    () => composition ?? DEFAULT_COMPOSITION,
  );
  const usePanel = assistantPresentation === "panel";
  const assistantOpen = dialog !== "closed";

  useEffect(() => {
    onAssistantOpenChange?.(assistantOpen);
  }, [assistantOpen, onAssistantOpenChange]);

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
      const nextLinks = attachedIds.has(result.group.id)
        ? links
        : [...links, emptyProductLink(result.group.id, links.length)];
      // desmarcar não pode deixar preço/exclusão antiga — troca só deste grupo
      const nextPrices = replaceGroupOptionPrices(productOptionPrices, result.group, prices);
      const selectedIds = resolveSelectedOptionIds(result.group, draft.choices);
      const nextExclusions = mergeExclusionsForGroup(
        productOptionExclusions,
        result.group,
        selectedIds,
      );

      // produto existente: grava vínculo + preços + o que não oferece
      if (currentProductId) {
        await catalogAdminApi.updateProduct(currentProductId, {
          product_option_groups: serializeProductLinks(nextLinks),
          option_prices: nextPrices,
          option_exclusions: nextExclusions,
        });
      }

      return {
        ...result,
        prices: nextPrices,
        exclusions: nextExclusions,
        nextLinks,
        draft,
      };
    },
    onSuccess: ({ group, reused, prices, exclusions, nextLinks }, variables) => {
      invalidateGroups();
      if (currentProductId) {
        void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(currentProductId) });
      }
      setLocalGroups((current) => {
        const without = current.filter((item) => item.id !== group.id);
        return [...without, group];
      });
      onChange(nextLinks);
      onOptionPricesChange?.(prices);
      onOptionExclusionsChange?.(exclusions);
      if (variables.existing) {
        toast.success(
          currentProductId
            ? "Atualizado — preços deste produto e itens da biblioteca"
            : "Atualizado na biblioteca",
        );
      } else if (reused) {
        toast.success("Usando a biblioteca da casa neste produto");
      } else {
        toast.success(
          currentProductId
            ? "Salvo na biblioteca e neste produto"
            : "Salvo na biblioteca — confirme o cadastro do produto",
        );
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

  const assistantTitle =
    dialog === "edit"
      ? `Ajustar ${editingGroup?.name ?? "opções"}`
      : dialog === "half"
        ? "Cliente pode escolher sabores?"
        : "Como você vende este produto?";

  const assistantDescription =
    dialog === "half"
      ? "Perguntas simples — o cliente combina sabores no cardápio."
      : dialog === "edit"
        ? "Nome e descrição na biblioteca; o preço vale só neste produto."
        : "Uma pergunta por vez. Itens entram na biblioteca; preços ficam neste produto.";

  const linkGroupFromLibrary = async (group: OptionGroupAdmin) => {
    if (attachedIds.has(group.id)) {
      toast.success(`“${group.name}” já está neste produto`);
      closeDialog();
      return;
    }
    const nextLinks = [...links, emptyProductLink(group.id, links.length)];
    if (currentProductId) {
      try {
        await catalogAdminApi.updateProduct(currentProductId, {
          product_option_groups: serializeProductLinks(nextLinks),
        });
        void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(currentProductId) });
      } catch {
        toast.error("Não deu pra vincular. Tente de novo.");
        return;
      }
    }
    onChange(nextLinks);
    toast.success(`“${group.name}” da biblioteca vinculado a este produto`);
    closeDialog();
  };

  const assistantBody =
    dialog === "create" || dialog === "edit" ? (
      <CustomizationAssistant
        mode={dialog === "edit" ? "edit" : "create"}
        initialGroup={editingGroup}
        availableGroups={mergedGroups}
        attachedIds={attachedIds}
        categoryName={categoryName}
        priceContext="product"
        productOptionPrices={productOptionPrices}
        productOptionExclusions={productOptionExclusions}
        pending={saveMutation.isPending}
        confirmLabel={
          dialog === "edit"
            ? `Salvar ${editingGroup?.name?.toLowerCase() ?? "opções"}`
            : "Salvar e usar neste produto"
        }
        cancelLabel={usePanel ? "Voltar à lista" : "Cancelar"}
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
          void linkGroupFromLibrary(group);
        }}
        onSave={async (draft, existing) => {
          await saveMutation.mutateAsync({ draft, existing });
        }}
      />
    ) : dialog === "half" && canHalf ? (
      <div className="space-y-4">
        <ProductCompositionEditor
          value={halfDraft}
          onChange={setHalfDraft}
          categories={categories}
          currentProductId={currentProductId}
        />
        <div
          className={cn(
            "sticky bottom-0 z-20 mt-4 flex flex-col-reverse gap-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 py-3 backdrop-blur-md",
            "shadow-[0_-10px_28px_-16px_rgba(0,0,0,0.18)]",
            "sm:flex-row sm:justify-end",
          )}
        >
          <Button type="button" variant="outline" onClick={closeDialog}>
            {usePanel ? "Voltar à lista" : "Cancelar"}
          </Button>
          <Button type="button" className="bg-brand hover:brightness-95" onClick={saveHalf}>
            Salvar sabores
          </Button>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-3">
      {usePanel && assistantOpen ? (
        <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 sm:p-5">
          <div className="pr-2">
            <p className="text-base font-semibold leading-snug">{assistantTitle}</p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{assistantDescription}</p>
          </div>
          {assistantBody}
        </div>
      ) : (
        <>
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
        </>
      )}

      {!usePanel ? (
        <Dialog
          open={assistantOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          className="max-w-lg sm:max-w-3xl lg:max-w-4xl"
        >
          <DialogContent
            onClose={closeDialog}
            className="flex max-h-[min(92vh,860px)] flex-col overflow-hidden p-0 sm:p-0"
          >
            <DialogHeader className="shrink-0 border-b border-[hsl(var(--border))] px-6 pb-4 pt-6">
              <DialogTitle>{assistantTitle}</DialogTitle>
              <DialogDescription>{assistantDescription}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{assistantBody}</div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
