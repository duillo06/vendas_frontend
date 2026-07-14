import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { FlowMascot, type FlowMood } from "./FlowMascot";
import type { FlowLine } from "./flowMessages";

type FlowEmptyStateProps = {
  line: FlowLine;
  action?: ReactNode;
  className?: string;
};

// Estado vazio humanizado: o Flow aparece e convida a dar o próximo passo.
export function FlowEmptyState({ line, action, className }: FlowEmptyStateProps) {
  const mood: FlowMood = line.mood ?? "thinking";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-soft bg-brand-soft/20 px-6 py-8 text-center",
        className,
      )}
    >
      <FlowMascot mood={mood} size="lg" />
      {line.title ? (
        <p className="text-base font-semibold">
          {line.emoji ? <span className="mr-1">{line.emoji}</span> : null}
          {line.title}
        </p>
      ) : null}
      <p className="max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{line.text}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </motion.div>
  );
}
