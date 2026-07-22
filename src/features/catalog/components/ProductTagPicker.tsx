import { cn } from "@/shared/lib/utils";

import {
  isPresetActive,
  showcasePresets,
  traitPresets,
  togglePreset,
  type ProductTagPreset,
} from "../utils/productTags";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
};

export function ProductTagPicker({ tags, onChange, className }: Props) {
  const toggle = (preset: ProductTagPreset) => {
    const next = togglePreset(tags, preset, !isPresetActive(tags, preset));
    onChange(next);
  };

  return (
    <div className={cn("space-y-5", className)}>
      <TagSection
        title="Na vitrine da loja"
        description="Escolha como este produto sobe na Home — o cliente vê o selo automaticamente."
        presets={showcasePresets()}
        tags={tags}
        onToggle={toggle}
      />
      <TagSection
        title="Características"
        description="Selos opcionais no cardápio (vegano, picante…)."
        presets={traitPresets()}
        tags={tags}
        onToggle={toggle}
      />
    </div>
  );
}

function TagSection({
  title,
  description,
  presets,
  tags,
  onToggle,
}: {
  title: string;
  description: string;
  presets: ProductTagPreset[];
  tags: string[];
  onToggle: (preset: ProductTagPreset) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => {
          const selected = isPresetActive(tags, preset);
          return (
            <li key={preset.id}>
              <button
                type="button"
                onClick={() => onToggle(preset)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition",
                  selected
                    ? "border-brand bg-[hsl(var(--primary-soft))] shadow-sm"
                    : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.35)]",
                )}
              >
                <span className="text-lg leading-none">{preset.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{preset.label}</span>
                  <span className="mt-0.5 block text-[11px] text-[hsl(var(--muted-foreground))]">
                    {preset.hint}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
