import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  catalogAdminApi,
  type CategoryAdmin,
  type ProductAdminListItem,
} from "@/features/catalog/api/catalogAdminApi";
import { catalogAdminKeys } from "@/features/catalog/constants/catalog-admin-keys";
import { CurrencyInput } from "@/shared/components/CurrencyInput";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

import {
  createProductFromRecipe,
  recipeToPriceRows,
  type RecipePriceRow,
} from "../createFromRecipe";
import type { WizardBasics, WizardImage } from "./types";

type Step = "preparing" | "prices" | "review";

type RecipeProductFlowProps = {
  basics: WizardBasics;
  images: WizardImage[];
  category: CategoryAdmin;
  siblings: ProductAdminListItem[];
  onBack: () => void;
  onCreated: (productId: string) => void;
};

export function RecipeProductFlow({
  basics,
  images,
  category,
  siblings,
  onBack,
  onCreated,
}: RecipeProductFlowProps) {
  const [step, setStep] = useState<Step>("preparing");
  const [basePrice, setBasePrice] = useState(0);
  const [rows, setRows] = useState<RecipePriceRow[]>([]);
  const [copyFromId, setCopyFromId] = useState("");
  const [copyMode, setCopyMode] = useState<"same" | "percent" | "fixed">("same");
  const [copyPercent, setCopyPercent] = useState(0);
  const [copyFixed, setCopyFixed] = useState(0);

  const recipeQuery = useQuery({
    queryKey: catalogAdminKeys.categoryRecipe(category.id),
    queryFn: () => catalogAdminApi.getCategoryRecipe(category.id),
  });

  useEffect(() => {
    if (!recipeQuery.data) return;
    setRows(recipeToPriceRows(recipeQuery.data));
    const t = window.setTimeout(() => setStep("prices"), 900);
    return () => window.clearTimeout(t);
  }, [recipeQuery.data]);

  const grouped = useMemo(() => {
    const map = new Map<string, RecipePriceRow[]>();
    for (const row of rows) {
      const list = map.get(row.group_name) ?? [];
      list.push(row);
      map.set(row.group_name, list);
    }
    return [...map.entries()];
  }, [rows]);

  const applyCopyFromSibling = async () => {
    if (!copyFromId) return;
    try {
      const source = await catalogAdminApi.getProduct(copyFromId);
      const priceMap = new Map(
        (source.option_prices ?? []).map((p) => [p.option_id, p.price]),
      );
      setRows((current) =>
        current.map((row) => {
          if (!priceMap.has(row.option_id)) return row;
          let price = priceMap.get(row.option_id)!;
          if (copyMode === "percent") {
            price = Math.round(price * (1 + copyPercent / 100) * 100) / 100;
          } else if (copyMode === "fixed") {
            price = copyFixed;
          }
          return { ...row, price, included: true };
        }),
      );
      toast.success("Preços copiados — ajuste o que quiser");
    } catch {
      toast.error("Não deu pra copiar os preços.");
    }
  };

  const create = useMutation({
    mutationFn: () =>
      createProductFromRecipe({
        name: basics.name,
        description: basics.description,
        categoryId: basics.categoryId,
        basePrice,
        optionPrices: rows
          .filter((r) => r.included)
          .map((r) => ({ option_id: r.option_id, price: r.price })),
        optionExclusions: rows.filter((r) => !r.included).map((r) => r.option_id),
        images,
      }),
    onSuccess: (product) => onCreated(product.id),
    onError: () => toast.error("Não deu pra criar o produto. Tente de novo."),
  });

  if (step === "preparing" || recipeQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-medium">Montando a partir de como funciona {category.name}…</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Carregando tamanhos, bordas e o que você já configurou.
        </p>
      </div>
    );
  }

  if (recipeQuery.isError || !recipeQuery.data?.libraries.length) {
    return (
      <div className="space-y-4 py-6 text-center">
        <p className="text-sm font-medium">Esta categoria ainda não tem “como funciona” completo.</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Configure em Categorias, ou use o cadastro avançado.
        </p>
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
      </div>
    );
  }

  if (step === "review") {
    const included = rows.filter((r) => r.included);
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary-soft))]/40 p-4">
          <p className="text-sm font-semibold">{basics.name}</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {category.name} · base{" "}
            {basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {included.slice(0, 8).map((r) => (
              <li key={r.option_id}>
                {r.name}
                {r.price > 0
                  ? ` (+${r.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })})`
                  : ""}
              </li>
            ))}
            {included.length > 8 ? (
              <li className="text-xs text-[hsl(var(--muted-foreground))]">
                +{included.length - 8} opções
              </li>
            ) : null}
          </ul>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setStep("prices")}>
            Voltar
          </Button>
          <Button
            type="button"
            className="bg-brand hover:brightness-95"
            disabled={create.isPending || basePrice <= 0}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Criando…" : "Criar produto"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-xs space-y-2">
        <Label>Preço base</Label>
        <CurrencyInput value={basePrice} onChange={setBasePrice} />
      </div>

      {siblings.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-[hsl(var(--border))] bg-white p-3">
          <p className="text-sm font-medium">Quer aproveitar preços de outro produto?</p>
          <select
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 text-sm"
            value={copyFromId}
            onChange={(e) => setCopyFromId(e.target.value)}
          >
            <option value="">Escolher produto…</option>
            {siblings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["same", "Copiar iguais"],
                ["percent", "Ajustar em %"],
                ["fixed", "Mesmo valor"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCopyMode(value)}
                className={cn(
                  "rounded-lg border-2 px-2 py-2 text-xs font-medium",
                  copyMode === value
                    ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary-soft))]"
                    : "border-[hsl(var(--border))]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {copyMode === "percent" ? (
            <label className="flex items-center gap-2 text-sm">
              %
              <Input
                type="number"
                className="h-9 w-24"
                value={copyPercent}
                onChange={(e) => setCopyPercent(Number(e.target.value) || 0)}
              />
            </label>
          ) : null}
          {copyMode === "fixed" ? (
            <CurrencyInput value={copyFixed} onChange={setCopyFixed} />
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!copyFromId}
            onClick={() => void applyCopyFromSibling()}
          >
            Aplicar preços
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        <p className="text-sm font-medium">Quanto custa cada opção neste produto?</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Desmarque o que este produto não oferece.
        </p>
        {grouped.map(([groupName, items]) => (
          <div key={groupName} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">{groupName}</p>
            <ul className="space-y-2">
              {items.map((row) => (
                <li
                  key={row.option_id}
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between",
                    row.included
                      ? "border-[hsl(var(--border))] bg-white"
                      : "border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 opacity-70",
                  )}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 text-left text-sm font-medium"
                    onClick={() =>
                      setRows((current) =>
                        current.map((r) =>
                          r.option_id === row.option_id ? { ...r, included: !r.included } : r,
                        ),
                      )
                    }
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border-2",
                        row.included ? "border-brand bg-brand text-white" : "border-[hsl(var(--border))]",
                      )}
                    >
                      {row.included ? <Check className="h-3 w-3" /> : null}
                    </span>
                    {row.name}
                  </button>
                  {row.included ? (
                    <CurrencyInput
                      value={row.price}
                      onChange={(price) =>
                        setRows((current) =>
                          current.map((r) =>
                            r.option_id === row.option_id ? { ...r, price } : r,
                          ),
                        )
                      }
                    />
                  ) : (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">Não oferece</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button
          type="button"
          className="bg-brand hover:brightness-95"
          disabled={basePrice <= 0 || rows.every((r) => !r.included)}
          onClick={() => setStep("review")}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
