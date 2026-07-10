import type {
  Option,
  OptionDisplayType,
  OptionGroup,
  OptionSelectionMode,
  OptionSelectionType,
  PricingConfig,
} from "@/features/catalog/types/catalog.types";
import type { OptionGroupAdmin, ProductOptionGroupLink } from "@/features/catalog/api/catalogAdminApi";

function mergeJsonConfig<T extends Record<string, unknown>>(
  base?: Record<string, unknown> | null,
  override?: Record<string, unknown> | null,
  fallback?: T,
): T {
  return { ...(fallback ?? {}), ...(base ?? {}), ...(override ?? {}) } as T;
}

function toOption(option: OptionGroupAdmin["options"][number]): Option {
  return {
    id: option.id,
    name: option.name,
    description: option.description ?? null,
    price_modifier: option.price_modifier,
    price_type: option.price_type ?? "fixed",
    is_available: option.is_available,
    image_url: option.image_url ?? null,
    icon: option.icon ?? null,
    stock_quantity: option.stock_quantity ?? null,
    metadata: option.metadata ?? null,
  };
}

export function mergeGroupWithLink(
  group: OptionGroupAdmin,
  link: ProductOptionGroupLink,
): OptionGroup {
  const pricingConfig = mergeJsonConfig<PricingConfig>(
    group.pricing_config as Record<string, unknown> | undefined,
    link.override_pricing_config as Record<string, unknown> | undefined,
    { strategy: "additive" },
  );

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    selection_type: group.selection_type as OptionSelectionType,
    selection_mode: (group.selection_mode ?? "pick") as OptionSelectionMode,
    display_type: (link.override_display_type ?? group.display_type ?? "list") as OptionDisplayType,
    min_selections: link.override_min ?? group.min_selections,
    max_selections: link.override_max ?? group.max_selections,
    is_required: link.override_required ?? group.is_required,
    sort_order: link.sort_order,
    options: group.options.filter((option) => option.is_active).map(toOption),
    icon: group.icon ?? null,
    image_url: group.image_url ?? null,
    visibility: (group.visibility ?? "always") as OptionGroup["visibility"],
    pricing_config: pricingConfig,
    ui_config: mergeJsonConfig(group.ui_config, link.override_ui_config),
    default_option_ids: group.default_option_ids ?? [],
  };
}

export function buildPreviewOptionGroups(
  links: ProductOptionGroupLink[],
  groupsById: Map<string, OptionGroupAdmin>,
): OptionGroup[] {
  return links
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => {
      const group = groupsById.get(link.option_group_id);
      if (!group) return null;
      return mergeGroupWithLink(group, link);
    })
    .filter((group): group is OptionGroup => group !== null);
}
