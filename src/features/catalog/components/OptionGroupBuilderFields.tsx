import type {
  OptionDisplayType,
  OptionSelectionMode,
  OptionSelectionType,
  OptionUiConfig,
  PricingConfig,
} from "@/features/catalog/types/catalog.types";
import type { OptionGroupAdmin } from "@/features/catalog/api/catalogAdminApi";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export type BuilderFieldsState = {
  description: string;
  selection_type: OptionSelectionType;
  selection_mode: OptionSelectionMode;
  display_type: OptionDisplayType;
  visibility: "always" | "hidden" | "conditional";
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  icon: string;
  ui_hint: string;
  show_when_group_id: string;
  show_when_option_ids: string[];
  pricing_config: PricingConfig;
};

const DISPLAY_OPTIONS: { value: OptionDisplayType; label: string }[] = [
  { value: "list", label: "Lista" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "cards", label: "Cards" },
  { value: "image_cards", label: "Cards com imagem" },
  { value: "dropdown", label: "Dropdown" },
  { value: "stepper", label: "Stepper (+/−)" },
  { value: "icon_chips", label: "Chips com ícone" },
  { value: "color_swatch", label: "Seletor de cor" },
];

const PRICING_OPTIONS: { value: PricingConfig["strategy"]; label: string }[] = [
  { value: "additive", label: "Somar tudo" },
  { value: "charge_extras_only", label: "Cobrar só extras" },
  { value: "first_n_free", label: "Primeiros N grátis" },
  { value: "quantity_multiplier", label: "Multiplicador por quantidade" },
  { value: "tiered", label: "Faixas por quantidade" },
];

type OptionGroupBuilderFieldsProps = {
  value: BuilderFieldsState;
  onChange: (patch: Partial<BuilderFieldsState>) => void;
  idPrefix: string;
  availableGroups?: OptionGroupAdmin[];
  currentGroupId?: string;
};

export function OptionGroupBuilderFields({
  value,
  onChange,
  idPrefix,
  availableGroups = [],
  currentGroupId,
}: OptionGroupBuilderFieldsProps) {
  const setPricing = (patch: Partial<PricingConfig>) => {
    onChange({ pricing_config: { ...value.pricing_config, ...patch } as PricingConfig });
  };

  const triggerGroups = availableGroups.filter((group) => group.id !== currentGroupId);
  const triggerOptions =
    availableGroups.find((group) => group.id === value.show_when_group_id)?.options ?? [];

  return (
    <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-4">
      <p className="text-sm font-medium">Configuração do builder</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-description`}>Descrição (opcional)</Label>
          <Input
            id={`${idPrefix}-description`}
            value={value.description}
            placeholder="Ex: Escolha o tamanho"
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-icon`}>Ícone / emoji</Label>
          <Input
            id={`${idPrefix}-icon`}
            value={value.icon}
            placeholder="🍕"
            maxLength={8}
            onChange={(event) => onChange({ icon: event.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-selection-type`}>Tipo de seleção</Label>
          <select
            id={`${idPrefix}-selection-type`}
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            value={value.selection_type}
            onChange={(event) =>
              onChange({ selection_type: event.target.value as OptionSelectionType })
            }
          >
            <option value="single">Única</option>
            <option value="multiple">Múltipla</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-selection-mode`}>Modo</Label>
          <select
            id={`${idPrefix}-selection-mode`}
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            value={value.selection_mode}
            onChange={(event) =>
              onChange({ selection_mode: event.target.value as OptionSelectionMode })
            }
          >
            <option value="pick">Escolher</option>
            <option value="quantity">Quantidade</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-display-type`}>Visual</Label>
          <select
            id={`${idPrefix}-display-type`}
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            value={value.display_type}
            onChange={(event) =>
              onChange({ display_type: event.target.value as OptionDisplayType })
            }
          >
            {DISPLAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-visibility`}>Visibilidade</Label>
          <select
            id={`${idPrefix}-visibility`}
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            value={value.visibility}
            onChange={(event) =>
              onChange({
                visibility: event.target.value as BuilderFieldsState["visibility"],
              })
            }
          >
            <option value="always">Sempre</option>
            <option value="hidden">Oculto</option>
            <option value="conditional">Condicional</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-pricing-strategy`}>Preço</Label>
          <select
            id={`${idPrefix}-pricing-strategy`}
            className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
            value={value.pricing_config.strategy}
            onChange={(event) => {
              const strategy = event.target.value as PricingConfig["strategy"];
              if (strategy === "tiered") {
                setPricing({
                  strategy,
                  tiers: [{ from: 1, to: 2, unit_price: 0 }],
                });
                return;
              }
              setPricing({ strategy });
            }}
          >
            {PRICING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {value.visibility === "conditional" ? (
        <div className="space-y-3 rounded-lg border border-dashed border-[hsl(var(--border))] p-3">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            Mostrar este grupo quando...
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-show-when-group`}>Grupo gatilho</Label>
              <select
                id={`${idPrefix}-show-when-group`}
                className="h-10 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm"
                value={value.show_when_group_id}
                onChange={(event) =>
                  onChange({
                    show_when_group_id: event.target.value,
                    show_when_option_ids: [],
                  })
                }
              >
                <option value="">Selecione...</option>
                {triggerGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            {triggerOptions.length ? (
              <div className="space-y-2">
                <Label>Opções gatilho (vazio = qualquer)</Label>
                <div className="flex flex-wrap gap-2">
                  {triggerOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={value.show_when_option_ids.includes(option.id)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...value.show_when_option_ids, option.id]
                            : value.show_when_option_ids.filter((id) => id !== option.id);
                          onChange({ show_when_option_ids: next });
                        }}
                      />
                      {option.name}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min`}>Mínimo</Label>
          <Input
            id={`${idPrefix}-min`}
            type="number"
            min={0}
            value={value.min_selections}
            onChange={(event) => onChange({ min_selections: Number(event.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-max`}>Máximo (0 = ilimitado)</Label>
          <Input
            id={`${idPrefix}-max`}
            type="number"
            min={0}
            value={value.max_selections}
            onChange={(event) => onChange({ max_selections: Number(event.target.value) || 0 })}
          />
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[hsl(var(--border))] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Obrigatório</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {value.is_required ? "Cliente precisa escolher" : "Pode pular"}
            </p>
          </div>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[hsl(var(--primary))]"
            checked={value.is_required}
            onChange={(event) => onChange({ is_required: event.target.checked })}
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-hint`}>Dica para o cliente</Label>
        <Input
          id={`${idPrefix}-hint`}
          value={value.ui_hint}
          placeholder="Ex: Escolha até 3"
          onChange={(event) => onChange({ ui_hint: event.target.value })}
        />
      </div>

      {value.pricing_config.strategy === "charge_extras_only" ? (
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor={`${idPrefix}-included`}>Inclusos no preço base</Label>
          <Input
            id={`${idPrefix}-included`}
            type="number"
            min={1}
            value={value.pricing_config.included_count}
            onChange={(event) =>
              setPricing({ included_count: Number(event.target.value) || 1 })
            }
          />
        </div>
      ) : null}

      {value.pricing_config.strategy === "first_n_free" ? (
        <div className="space-y-2 sm:max-w-xs">
          <Label htmlFor={`${idPrefix}-free-count`}>Quantos saem grátis</Label>
          <Input
            id={`${idPrefix}-free-count`}
            type="number"
            min={1}
            value={value.pricing_config.free_count}
            onChange={(event) => setPricing({ free_count: Number(event.target.value) || 1 })}
          />
        </div>
      ) : null}

      {value.pricing_config.strategy === "tiered" ? (
        <TieredPricingEditor
          idPrefix={idPrefix}
          tiers={value.pricing_config.tiers}
          onChange={(tiers) => setPricing({ strategy: "tiered", tiers })}
        />
      ) : null}
    </div>
  );
}

function TieredPricingEditor({
  idPrefix,
  tiers,
  onChange,
}: {
  idPrefix: string;
  tiers: Array<{ from: number; to?: number; unit_price: number }>;
  onChange: (tiers: Array<{ from: number; to?: number; unit_price: number }>) => void;
}) {
  const updateTier = (index: number, patch: Partial<{ from: number; to?: number; unit_price: number }>) => {
    onChange(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  };

  return (
    <div className="space-y-2">
      <Label>Faixas de preço (quantidade total no grupo)</Label>
      {tiers.map((tier, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Input
            type="number"
            min={1}
            placeholder="De"
            value={tier.from}
            onChange={(event) => updateTier(index, { from: Number(event.target.value) || 1 })}
          />
          <Input
            type="number"
            min={0}
            placeholder="Até (0=∞)"
            value={tier.to ?? 0}
            onChange={(event) => {
              const raw = Number(event.target.value);
              updateTier(index, { to: raw > 0 ? raw : undefined });
            }}
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="R$/un"
            value={tier.unit_price}
            onChange={(event) =>
              updateTier(index, { unit_price: Number(event.target.value) || 0 })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={tiers.length <= 1}
            onClick={() => onChange(tiers.filter((_, i) => i !== index))}
          >
            Remover
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          onChange([
            ...tiers,
            {
              from: (tiers[tiers.length - 1]?.to ?? tiers[tiers.length - 1]?.from ?? 0) + 1,
              unit_price: 0,
            },
          ])
        }
      >
        Adicionar faixa
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))]" id={`${idPrefix}-tiered-help`}>
        Ex: de 1 a 2 por R$ 3/un; de 3 em diante por R$ 2/un.
      </p>
    </div>
  );
}

export function builderFieldsFromGroup(group: {
  description?: string | null;
  selection_type: string;
  selection_mode?: string;
  display_type?: string;
  visibility?: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  icon?: string | null;
  ui_config?: OptionUiConfig | null;
  pricing_config?: PricingConfig | null;
}): BuilderFieldsState {
  return {
    description: group.description ?? "",
    selection_type: group.selection_type as OptionSelectionType,
    selection_mode: (group.selection_mode ?? "pick") as OptionSelectionMode,
    display_type: (group.display_type ?? "list") as OptionDisplayType,
    visibility: (group.visibility ?? "always") as BuilderFieldsState["visibility"],
    min_selections: group.min_selections,
    max_selections: group.max_selections,
    is_required: group.is_required,
    icon: group.icon ?? "",
    ui_hint: group.ui_config?.hint ?? "",
    show_when_group_id: group.ui_config?.show_when?.group_id ?? "",
    show_when_option_ids: group.ui_config?.show_when?.option_ids ?? [],
    pricing_config: group.pricing_config ?? { strategy: "additive" },
  };
}

export function builderFieldsToPayload(fields: BuilderFieldsState): Record<string, unknown> {
  const ui_config: OptionUiConfig = {};
  if (fields.ui_hint.trim()) ui_config.hint = fields.ui_hint.trim();
  if (fields.visibility === "conditional" && fields.show_when_group_id) {
    ui_config.show_when = {
      group_id: fields.show_when_group_id,
      ...(fields.show_when_option_ids.length
        ? { option_ids: fields.show_when_option_ids }
        : {}),
    };
  }

  return {
    description: fields.description.trim() || null,
    selection_type: fields.selection_type,
    selection_mode: fields.selection_mode,
    display_type: fields.display_type,
    visibility: fields.visibility,
    min_selections: fields.is_required ? Math.max(fields.min_selections, 1) : fields.min_selections,
    max_selections: fields.max_selections,
    is_required: fields.is_required,
    icon: fields.icon.trim(),
    pricing_config: fields.pricing_config,
    ui_config,
  };
}
