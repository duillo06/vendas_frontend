import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import type { ProductOptionGroupLink } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminApi } from "@/features/catalog/api/catalogAdminApi";
import { ProductCustomizationsPanel } from "@/features/catalog/components/ProductCustomizationsPanel";
import {
  DEFAULT_COMPOSITION,
  type CompositionForm,
} from "@/features/catalog/components/ProductCompositionEditor";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { linksFromProduct, serializeProductLinks } from "@/features/catalog/utils/productLinks";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

export function OptionsIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<ProductOptionGroupLink[]>(() => linksFromProduct(product));
  const [optionPrices, setOptionPrices] = useState(
    () => product.option_prices ?? [],
  );
  const [composition, setComposition] = useState<CompositionForm>(() =>
    product.composition
      ? { ...DEFAULT_COMPOSITION, ...product.composition }
      : { ...DEFAULT_COMPOSITION },
  );

  const { data: optionGroups } = useQuery({
    queryKey: catalogAdminKeys.optionGroups(),
    queryFn: () => catalogAdminApi.listOptionGroups(),
  });

  const { data: categories } = useQuery({
    queryKey: catalogAdminKeys.categories(),
    queryFn: () => catalogAdminApi.listCategories(),
  });

  const save = useMutation({
    mutationFn: () =>
      catalogAdminApi.updateProduct(product.id, {
        product_option_groups: serializeProductLinks(links),
        composition,
        ...(optionPrices.length ? { option_prices: optionPrices } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.optionGroups() });
      onSuccess(
        links.length || composition.enabled
          ? "Pronto — como você vende este produto ficou salvo"
          : "Opções de venda removidas deste produto",
      );
    },
    onError: () => toast.error("Não deu pra salvar. Tente de novo."),
  });

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="🧀"
      title="Como você vende?"
      description="Perguntas simples — o que criar fica na biblioteca e serve em outros produtos."
      wide
    >
      <ProductCustomizationsPanel
        availableGroups={optionGroups ?? []}
        links={links}
        onChange={setLinks}
        categoryName={product.category?.name}
        categories={categories}
        currentProductId={product.id}
        productOptionPrices={optionPrices}
        onOptionPricesChange={setOptionPrices}
        composition={composition}
        onCompositionChange={setComposition}
      />
      <FlowActions onCancel={onClose} onConfirm={() => save.mutate()} pending={save.isPending} />
    </IntentFlowDialog>
  );
}
