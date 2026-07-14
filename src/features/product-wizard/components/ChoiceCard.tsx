import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

type ChoiceCardProps = {
  emoji?: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
};

// cartão grande de escolha — o coração da experiência conversacional
export function ChoiceCard({ emoji, label, description, selected, onSelect }: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        "relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors sm:p-5",
        selected
          ? "border-brand bg-brand-soft/40 shadow-sm"
          : "border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:border-brand-soft hover:bg-brand-soft/20",
      )}
    >
      {emoji ? <span className="text-3xl sm:text-4xl">{emoji}</span> : null}
      <span className="flex-1">
        <span className="block text-base font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-brand bg-brand text-white" : "border-[hsl(var(--border))]",
        )}
      >
        {selected ? <Check className="h-4 w-4" /> : null}
      </span>
    </motion.button>
  );
}
