import { cn } from "@/shared/lib/utils";

import type { GroupGuidance as GroupGuidanceType } from "./types";

type GroupGuidanceProps = {
  guidance: GroupGuidanceType | null;
  invalid?: boolean;
};

const toneClass: Record<GroupGuidanceType["tone"], string> = {
  neutral: "text-[hsl(var(--muted-foreground))]",
  warm: "text-brand-accent",
  success: "text-brand",
  error: "text-red-600",
};

export function GroupGuidance({ guidance, invalid }: GroupGuidanceProps) {
  if (!guidance && !invalid) return null;

  const message = invalid ? "Complete esta etapa para continuar" : guidance?.message;
  const tone = invalid ? "error" : (guidance?.tone ?? "neutral");

  if (!message) return null;

  return (
    <p
      className={cn(
        "text-sm font-medium transition-colors duration-200",
        toneClass[tone],
        invalid && "animate-shake",
      )}
      role="status"
    >
      {message}
    </p>
  );
}
