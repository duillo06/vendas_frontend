import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import { FlowMascot } from "./FlowMascot";
import type { FlowLine } from "./flowMessages";

// confete leve, respeitando quem prefere menos animação
export function fireFlowConfetti() {
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const colors = ["#10b981", "#34d399", "#fbbf24", "#f472b6"];
  confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors, scalar: 0.9 });
  window.setTimeout(() => {
    confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, colors });
  }, 180);
}

type FlowSuccessProps = {
  open: boolean;
  line: FlowLine;
  actionLabel?: string;
  onAction?: () => void;
};

// Overlay de sucesso: check animado + Flow comemorando + confete.
export function FlowSuccess({ open, line, actionLabel, onAction }: FlowSuccessProps) {
  useEffect(() => {
    if (open) fireFlowConfetti();
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <div className="relative mx-auto mb-2 flex h-24 w-24 items-center justify-center">
              <FlowMascot mood="celebrating" size="xl" />
              <motion.span
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </motion.span>
            </div>

            <p className="text-lg font-bold">
              {line.emoji ? <span className="mr-1">{line.emoji}</span> : null}
              {line.title}
            </p>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{line.text}</p>

            {actionLabel && onAction ? (
              <Button type="button" size="lg" className="mt-5 w-full" onClick={onAction}>
                {actionLabel}
              </Button>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
