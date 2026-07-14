import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import { catalogAdminApi, type ProductCompositionAdmin } from "../api/catalogAdminApi";
import { catalogAdminKeys } from "../constants/catalog-admin-keys";
import type { CategoryAdmin } from "../api/catalogAdminApi";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

export type CompositionForm = ProductCompositionAdmin;

export const DEFAULT_COMPOSITION: CompositionForm = {
  enabled: false,
  source_type: "category",
  source_category_id: null,
  source_tag: "",
  custom_product_ids: [],
  label: "Escolher outro sabor",
  min_parts: 2,
  max_parts: 2,
  pricing_rule: "highest",
};

type Props = {
  value: CompositionForm;
  onChange: (next: CompositionForm) => void;
  categories?: CategoryAdmin[];
  currentProductId?: string;
};

const selectClass =
  "h-10 w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 text-sm";

export function ProductCompositionEditor({ value, onChange, categories, currentProductId }: Props) {
  const patch = (partial: Partial<CompositionForm>) => onChange({ ...value, ...partial });

  // só carrega a lista de produtos quando for "lista personalizada"
  const { data: products } = useQuery({
    queryKey: [...catalogAdminKeys.products(), "composition-picker"],
    queryFn: () => catalogAdminApi.listProducts({ page_size: "100" }),
    enabled: value.enabled && value.source_type === "custom",
  });

  const toggleCustom = (id: string) => {
    const set = new Set(value.custom_product_ids);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ custom_product_ids: [...set] });
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={value.enabled}
          onChange={(e) => patch({ enabled: e.target.checked })}
        />
        <span className="flex items-center gap-2 text-sm font-medium">
          <Layers className="h-4 w-4 text-brand" />
          Permitir composição (produto formado por outros produtos)
        </span>
      </label>
      <p className="mt-1 pl-7 text-xs text-[hsl(var(--muted-foreground))]">
        Ex: pizza meio a meio — o cliente escolhe outro sabor já cadastrado.
      </p>

      {value.enabled ? (
        <div className="mt-4 space-y-4 border-t border-[hsl(var(--border))] pt-4">
          <div className="space-y-2">
            <Label>Texto do botão</Label>
            <Input
              value={value.label}
              placeholder="Escolher outro sabor"
              onChange={(e) => patch({ label: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Total de partes (mín.)</Label>
              <Input
                type="number"
                min={1}
                value={value.min_parts}
                onChange={(e) => patch({ min_parts: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Total de partes (máx.)</Label>
              <Input
                type="number"
                min={1}
                value={value.max_parts}
                onChange={(e) => patch({ max_parts: Number(e.target.value) || 1 })}
              />
            </div>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            2 e 2 = meio a meio (cliente escolhe 1 sabor extra). O produto principal já conta como 1 parte.
          </p>

          <div className="space-y-2">
            <Label>Regra de preço</Label>
            <select
              className={selectClass}
              value={value.pricing_rule}
              onChange={(e) => patch({ pricing_rule: e.target.value as CompositionForm["pricing_rule"] })}
            >
              <option value="highest">Cobrar o mais caro</option>
              <option value="average">Cobrar a média</option>
              <option value="main">Cobrar o preço deste produto</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>De onde vêm os produtos</Label>
            <select
              className={selectClass}
              value={value.source_type}
              onChange={(e) => patch({ source_type: e.target.value as CompositionForm["source_type"] })}
            >
              <option value="category">Mesma categoria</option>
              <option value="tag">Por tag</option>
              <option value="custom">Lista personalizada</option>
            </select>
          </div>

          {value.source_type === "category" ? (
            <div className="space-y-2">
              <Label>Categoria (vazio = categoria do próprio produto)</Label>
              <select
                className={selectClass}
                value={value.source_category_id ?? ""}
                onChange={(e) => patch({ source_category_id: e.target.value || null })}
              >
                <option value="">Categoria do produto</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {value.source_type === "tag" ? (
            <div className="space-y-2">
              <Label>Tag dos produtos</Label>
              <Input
                value={value.source_tag}
                placeholder="Ex: pizza-grande"
                onChange={(e) => patch({ source_tag: e.target.value })}
              />
            </div>
          ) : null}

          {value.source_type === "custom" ? (
            <div className="space-y-2">
              <Label>Produtos que podem compor</Label>
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-[hsl(var(--border))] p-2">
                {(products?.results ?? [])
                  .filter((p) => p.id !== currentProductId)
                  .map((p) => {
                    const checked = value.custom_product_ids.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm",
                          checked && "bg-brand-soft/40",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={() => toggleCustom(p.id)}
                        />
                        {p.name}
                      </label>
                    );
                  })}
                {!products?.results?.length ? (
                  <p className="px-2 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                    Nenhum produto encontrado.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
