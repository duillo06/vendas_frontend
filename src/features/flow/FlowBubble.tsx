import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { FlowMascot, type FlowMood } from "./FlowMascot";

type FlowBubbleProps = {
  text: string;
  emoji?: string;
  mood?: FlowMood;
  className?: string;
};

// Balãozinho de fala do Flow para espaços apertados (dicas, inline).
export function FlowBubble({ text, emoji, mood = "happy", className }: FlowBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex items-center gap-2", className)}
    >
      <FlowMascot mood={mood} size="xs" />
      <span className="relative rounded-2xl rounded-bl-sm border border-brand-soft bg-white px-3 py-1.5 text-sm text-[hsl(var(--foreground))] shadow-sm">
        {emoji ? <span className="mr-1">{emoji}</span> : null}
        {text}
      </span>
    </motion.div>
  );
}
