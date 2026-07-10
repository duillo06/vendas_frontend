import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  GripVertical,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { OptionGroupAdmin, ProductOptionGroupLink } from "@/features/catalog/api/catalogAdminApi";
import type { PricingConfig } from "@/features/catalog/types/catalog.types";
import { OptionGroupBuilderFields, builderFieldsFromGroup } from "@/features/catalog/components/OptionGroupBuilderFields";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

type ProductConfiguratorProps = {
  links: ProductOptionGroupLink[];
  availableGroups: OptionGroupAdmin[];
  onChange: (links: ProductOptionGroupLink[]) => void;
};

function emptyLink(groupId: string, sortOrder: number): ProductOptionGroupLink {
  return {
    option_group_id: groupId,
    sort_order: sortOrder,
    override_min: null,
    override_max: null,
    override_required: null,
    override_display_type: null,
    override_pricing_config: null,
    override_ui_config: null,
  };
}

export function ProductConfigurator({
  links,
  availableGroups,
  onChange,
}: ProductConfiguratorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const groupsById = useMemo(
    () => new Map(availableGroups.map((group) => [group.id, group])),
    [availableGroups],
  );

  const attachedIds = new Set(links.map((link) => link.option_group_id));
  const unattached = availableGroups.filter((group) => !attachedIds.has(group.id));

  const moveLink = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = links.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((link, sortOrder) => ({ ...link, sort_order: sortOrder })));
  };

  const addGroup = (groupId: string) => {
    onChange([...links, emptyLink(groupId, links.length)]);
    setPickerOpen(false);
    setExpandedId(groupId);
  };

  const removeLink = (groupId: string) => {
    onChange(
      links
        .filter((link) => link.option_group_id !== groupId)
        .map((link, index) => ({ ...link, sort_order: index })),
    );
  };

  const patchLink = (groupId: string, patch: Partial<ProductOptionGroupLink>) => {
    onChange(
      links.map((link) =>
        link.option_group_id === groupId ? { ...link, ...patch } : link,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label>Configurador do produto</Label>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Ordene os grupos e ajuste regras só neste produto, se precisar.
          </p>
        </div>
        {unattached.length ? (
          <div className="relative">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setPickerOpen((v) => !v)}>
              <Plus className="h-4 w-4" />
              Adicionar grupo
            </Button>
            {pickerOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg">
                {unattached.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className="flex w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[hsl(var(--muted))]/50"
                    onClick={() => addGroup(group.id)}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {links.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Nenhum grupo vinculado. Adicione grupos criados em Grupos de opções.
        </div>
      ) : (
        <ul className="space-y-2">
          {links.map((link, index) => {
            const group = groupsById.get(link.option_group_id);
            if (!group) return null;
            const expanded = expandedId === link.option_group_id;
            const overrideFields = builderFieldsFromGroup({
              ...group,
              min_selections: link.override_min ?? group.min_selections,
              max_selections: link.override_max ?? group.max_selections,
              is_required: link.override_required ?? group.is_required,
              display_type: link.override_display_type ?? group.display_type,
              pricing_config: (link.override_pricing_config ?? group.pricing_config) as PricingConfig | null,
              ui_config: { ...group.ui_config, ...link.override_ui_config },
            });

            return (
              <li
                key={link.option_group_id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-[hsl(var(--card))]",
                  expanded ? "border-[hsl(var(--primary))]/40" : "border-[hsl(var(--border))]",
                )}
              >
                <div className="flex items-center gap-2 px-3 py-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{group.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {group.options.length} opções · {group.display_type ?? "list"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === 0} onClick={() => moveLink(index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === links.length - 1} onClick={() => moveLink(index, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpandedId(expanded ? null : link.option_group_id)}>
                      {expanded ? <ChevronDown className="h-4 w-4 rotate-180" /> : <Settings2 className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => removeLink(link.option_group_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expanded ? (
                  <div className="space-y-4 border-t border-[hsl(var(--border))] px-4 py-4">
                    <UiHintOverrides />
                    <OptionGroupBuilderFields
                      idPrefix={`override-${link.option_group_id}`}
                      value={overrideFields}
                      onChange={(patch) => {
                        const next = { ...overrideFields, ...patch };
                        patchLink(link.option_group_id, {
                          override_min: next.min_selections !== group.min_selections ? next.min_selections : null,
                          override_max: next.max_selections !== group.max_selections ? next.max_selections : null,
                          override_required:
                            next.is_required !== group.is_required ? next.is_required : null,
                          override_display_type:
                            next.display_type !== (group.display_type ?? "list")
                              ? next.display_type
                              : null,
                          override_pricing_config:
                            JSON.stringify(next.pricing_config) !==
                            JSON.stringify(group.pricing_config ?? { strategy: "additive" })
                              ? next.pricing_config
                              : null,
                          override_ui_config:
                            next.ui_hint.trim() !== (group.ui_config?.hint ?? "").trim()
                              ? next.ui_hint.trim()
                                ? { hint: next.ui_hint.trim() }
                                : {}
                              : null,
                        });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        patchLink(link.option_group_id, {
                          override_min: null,
                          override_max: null,
                          override_required: null,
                          override_display_type: null,
                          override_pricing_config: null,
                          override_ui_config: null,
                        })
                      }
                    >
                      Limpar overrides
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function UiHintOverrides() {
  return (
    <p className="text-xs text-[hsl(var(--muted-foreground))]">
      Overrides valem só neste produto. Deixe em branco para usar a config padrão do grupo.
    </p>
  );
}
