type CategoryLike = {
  name: string;
  emoji?: string | null;
};

export function formatCategoryLabel(category: CategoryLike) {
  const emoji = category.emoji?.trim();
  return emoji ? `${emoji} ${category.name}` : category.name;
}
