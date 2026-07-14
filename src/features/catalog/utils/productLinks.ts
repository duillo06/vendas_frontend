import type { ProductOptionGroupLink } from "@/features/catalog/api/catalogAdminApi";

// pega os vínculos de grupo de um produto num formato estável pro form
export function linksFromProduct(product?: {
  product_option_groups?: ProductOptionGroupLink[];
  option_group_ids?: string[];
}): ProductOptionGroupLink[] {
  if (product?.product_option_groups?.length) {
    return product.product_option_groups.map((link, index) => ({
      option_group_id: link.option_group_id,
      sort_order: link.sort_order ?? index,
      override_min: link.override_min ?? null,
      override_max: link.override_max ?? null,
      override_required: link.override_required ?? null,
      override_display_type: link.override_display_type ?? null,
      override_pricing_config: link.override_pricing_config ?? null,
      override_ui_config: link.override_ui_config ?? null,
    }));
  }

  return (product?.option_group_ids ?? []).map((groupId, index) => ({
    option_group_id: groupId,
    sort_order: index,
  }));
}

// normaliza os vínculos pra mandar pra API (reordena pelo sort_order atual)
export function serializeProductLinks(links: ProductOptionGroupLink[]) {
  return links.map((link, index) => ({
    option_group_id: link.option_group_id,
    sort_order: index,
    override_min: link.override_min ?? null,
    override_max: link.override_max ?? null,
    override_required: link.override_required ?? null,
    override_display_type: link.override_display_type ?? null,
    override_pricing_config: link.override_pricing_config ?? null,
    override_ui_config: link.override_ui_config ?? null,
  }));
}
