import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { FlowMascot, type FlowMood } from "./FlowMascot";
import type { FlowLine } from "./flowMessages";

type FlowPanelProps = {
  line: FlowLine;
  className?: string;
  children?: ReactNode;
  compact?: boolean;
};

// Painel contextual do Flow: mascote + fala. Discreto, nunca invasivo.
export function FlowPanel({ line, className, children, compact }: FlowPanelProps) {
  const mood: FlowMood = line.mood ?? "idle";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 p-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <FlowMascot mood={mood} size={compact ? "sm" : "md"} />
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${line.title ?? ""}-${line.text}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {line.title ? (
                <p className="text-sm font-semibold leading-snug">
                  {line.emoji ? <span className="mr-1">{line.emoji}</span> : null}
                  {line.title}
                </p>
              ) : null}
              <p
                className={cn(
                  "text-sm text-[hsl(var(--muted-foreground))]",
                  line.title ? "mt-1" : "",
                )}
              >
                {!line.title && line.emoji ? <span className="mr-1">{line.emoji}</span> : null}
                {line.text}
              </p>
            </motion.div>
          </AnimatePresence>
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
