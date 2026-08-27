import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { catalogAdminApi, type ProductAdminDetail } from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { isProductPricedKind } from "@/features/catalog/utils/conversationalOptions";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { PriceDisplay } from "@/shared/components/PriceDisplay";
import { Label } from "@/shared/components/ui/label";
import { formatCurrency } from "@/shared/lib/format";

import { FlowActions, IntentFlowDialog } from "../components/IntentFlowDialog";
import type { IntentFlowProps } from "../types";

type SizePriceRow = {
  optionId: string;
  name: string;
  groupName: string;
  price: number;
  original: number;
};

/** tamanhos/volumes ligados ao produto — preço absoluto neste item */
function sizeRowsFromProduct(product: ProductAdminDetail): SizePriceRow[] {
  const priceMap = new Map(
    (product.option_prices ?? []).map((row) => [row.option_id, Number(row.price)]),
  );
  const excluded = new Set(product.option_exclusions ?? []);
  const rows: SizePriceRow[] = [];

  for (const link of product.product_option_groups ?? []) {
    const group = link.group;
    if (!group?.kind || !isProductPricedKind(group.kind)) continue;
    const options = [...(group.options ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    for (const option of options) {
      if (option.is_active === false) continue;
      if (excluded.has(option.id)) continue;
      const price = priceMap.get(option.id) ?? 0;
      rows.push({
        optionId: option.id,
        name: option.name,
        groupName: group.name || "Tamanho",
        price,
        original: price,
      });
    }
  }
  return rows;
}

export function PriceIntentFlow({ product, onClose, onSuccess }: IntentFlowProps) {
  const queryClient = useQueryClient();
  const initialSizes = useMemo(() => sizeRowsFromProduct(product), [product]);
  const hasSizes = initialSizes.length > 0;

  const [step, setStep] = useState<"ask" | "confirm">("ask");
  const [price, setPrice] = useState(product.base_price);
  const [sizes, setSizes] = useState<SizePriceRow[]>(initialSizes);

  const baseChanged = price !== product.base_price;
  const sizesChanged = sizes.some((row) => row.price !== row.original);
  const sizesValid = !hasSizes || sizes.every((row) => row.price > 0);
  const canContinue =
    sizesValid &&
    (hasSizes ? sizesChanged || (baseChanged && price > 0) : price > 0 && baseChanged);

  const save = useMutation({
    mutationFn: () => {
      const sizeIds = new Set(sizes.map((row) => row.optionId));
      const kept = (product.option_prices ?? []).filter((row) => !sizeIds.has(row.option_id));
      const option_prices = [
        ...kept,
        ...sizes.map((row) => ({ option_id: row.optionId, price: row.price })),
      ];
      return catalogAdminApi.updateProduct(product.id, {
        base_price: price,
        ...(hasSizes ? { option_prices } : {}),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.product(product.id) });
      void queryClient.invalidateQueries({ queryKey: catalogAdminKeys.products() });
      onSuccess(hasSizes ? "Preços atualizados" : "Preço atualizado");
    },
    onError: () => toast.error("Não deu pra salvar o preço. Tenta de novo."),
  });

  const setSizePrice = (optionId: string, next: number) => {
    setSizes((current) =>
      current.map((row) => (row.optionId === optionId ? { ...row, price: next } : row)),
    );
  };

  return (
    <IntentFlowDialog
      open
      onClose={onClose}
      emoji="💰"
      wide={hasSizes}
      title={
        step === "ask"
          ? hasSizes
            ? "Qual o preço de cada tamanho?"
            : "Qual será o novo preço?"
          : "Confirmar novos preços"
      }
      description={
        step === "ask"
          ? hasSizes
            ? "Valor de cada tamanho neste produto. Bordas e adicionais continuam à parte."
            : "Só o valor base. Adicionais continuam à parte."
          : "Revise antes de publicar no cardápio."
      }
    >
      {step === "ask" ? (
        <div className="space-y-4">
          {hasSizes ? (
            <>
              <ul className="space-y-2">
                {sizes.map((row) => (
                  <li
                    key={row.optionId}
                    className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{row.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Atual: {formatCurrency(row.original)}
                      </p>
                    </div>
                    <CurrencyInput
                      value={row.price}
                      onChange={(value) => setSizePrice(row.optionId, value)}
                      aria-label={`Preço de ${row.name}`}
                    />
                  </li>
                ))}
              </ul>
              <details className="rounded-xl border border-dashed border-[hsl(var(--border))] px-3 py-2">
                <summary className="cursor-pointer text-sm text-[hsl(var(--muted-foreground))]">
                  Preço base — {formatCurrency(product.base_price)}
                </summary>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="new-price">Novo preço base</Label>
                  <CurrencyInput id="new-price" value={price} onChange={setPrice} />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Só entra se o cliente não escolher tamanho.
                  </p>
                </div>
              </details>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 px-4 py-3 text-sm">
                Preço atual:{" "}
                <PriceDisplay value={product.base_price} className="font-semibold text-brand" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-price">Novo preço</Label>
                <CurrencyInput id="new-price" value={price} onChange={setPrice} />
              </div>
            </>
          )}
          <FlowActions
            onCancel={onClose}
            onConfirm={() => setStep("confirm")}
            confirmLabel="Continuar"
            confirmDisabled={!canContinue}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {hasSizes ? (
            <ul className="space-y-2 text-sm">
              {sizes.map((row) => (
                <li
                  key={row.optionId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] px-3 py-2"
                >
                  <span className="font-medium">{row.name}</span>
                  <span className="tabular-nums text-[hsl(var(--muted-foreground))]">
                    {row.price === row.original ? (
                      formatCurrency(row.price)
                    ) : (
                      <>
                        {formatCurrency(row.original)} →{" "}
                        <span className="font-semibold text-brand">{formatCurrency(row.price)}</span>
                      </>
                    )}
                  </span>
                </li>
              ))}
              {baseChanged ? (
                <li className="flex items-center justify-between gap-3 px-3 py-1 text-[hsl(var(--muted-foreground))]">
                  <span>Preço base</span>
                  <span className="tabular-nums">
                    {formatCurrency(product.base_price)} →{" "}
                    <span className="font-semibold text-brand">{formatCurrency(price)}</span>
                  </span>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {`De ${formatCurrency(product.base_price)} para `}
              <span className="font-semibold text-brand tabular-nums">
                {`${formatCurrency(price)}.`}
              </span>
            </p>
          )}
          <FlowActions
            onBack={() => setStep("ask")}
            onCancel={onClose}
            onConfirm={() => save.mutate()}
            confirmLabel={hasSizes ? "Confirmar preços" : "Confirmar preço"}
            pending={save.isPending}
          />
        </div>
      )}
    </IntentFlowDialog>
  );
}
