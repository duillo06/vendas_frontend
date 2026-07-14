import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

type SegmentCardProps = {
  emoji: string;
  label: string;
  tagline: string;
  selected: boolean;
  onSelect: () => void;
};

// cartão ilustrado dos segmentos (pizza, hambúrguer, ...) na Tela 2
export function SegmentCard({ emoji, label, tagline, selected, onSelect }: SegmentCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={cn(
        "flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors",
        selected
          ? "border-brand bg-brand-soft/50 shadow-md"
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-brand-soft hover:bg-brand-soft/20",
      )}
    >
      <span className="text-4xl sm:text-5xl">{emoji}</span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
      <span className="hidden text-xs text-[hsl(var(--muted-foreground))] sm:block">{tagline}</span>
    </motion.button>
  );
}
